// PDF compression engine.
//
// Four strategies, in increasing aggressiveness:
//   'lossless' — pdf-lib structural re-save (drops dead objects, object streams).
//                Text, images, vectors all untouched. This is the safe base.
//   'balanced' / 'high' — MuPDF (WASM) walks every image XObject, decodes it to a
//                pixmap (works for JPEG/Flate/CCITT/JBIG2/CMYK — anything MuPDF can
//                read), downsamples it, re-encodes as JPEG, and writes it back into
//                the SAME object number. Content streams are never touched, so text
//                stays selectable and page layout is preserved.
//   'extreme' — flattens each page to a single JPEG (loses text/vectors). Opt-in only.
//
// MuPDF.js is an ESM module that self-initialises its WASM. We load it at runtime from
// a CDN via a native dynamic import (webpackIgnore keeps webpack from trying to bundle
// the https URL, which a static export cannot do).

const MUPDF_URL = 'https://cdn.jsdelivr.net/npm/mupdf@1.26.4/dist/mupdf.js';

let _mupdfPromise = null;
export function loadMupdf() {
  if (!_mupdfPromise) {
    _mupdfPromise = import(/* webpackIgnore: true */ MUPDF_URL)
      .then((mod) => mod.default ?? mod)
      .catch((e) => {
        _mupdfPromise = null; // allow retry
        throw new Error('Could not load the MuPDF engine: ' + e.message);
      });
  }
  return _mupdfPromise;
}

// ---- Lossless base (pdf-lib) --------------------------------------------------

export async function compressLossless(bytes) {
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.save({ useObjectStreams: true, addDefaultPage: false });
}

// ---- Image downsampling (MuPDF, text preserved) -------------------------------

// A4 long edge ≈ 11.69". Without the page's placement matrix we can't know an image's
// exact on-page DPI, so we approximate: cap the longest pixel edge to (dpi × 11.69),
// i.e. the size a full-page image would need to hit the target DPI. Smaller images are
// left at their resolution (only recompressed if that shrinks them).
function maxEdgeForDpi(dpi) {
  return Math.round(dpi * 11.69);
}

// Copy a pixmap's samples into a tightly-packed w*h*comps buffer, dropping any
// per-row stride padding, so they can be stored as a raw (unfiltered) PDF image
// stream. MuPDF Flate-compresses the raw stream for us at save (compress=yes).
function packSamples(pix) {
  const w = pix.getWidth();
  const h = pix.getHeight();
  const comps = pix.getNumberOfComponents();
  const stride = pix.getStride();
  const rowBytes = w * comps;
  const src = pix.getPixels();
  const out = new Uint8Array(rowBytes * h);
  if (stride === rowBytes) {
    out.set(src.subarray(0, rowBytes * h));
  } else {
    for (let y = 0; y < h; y++) {
      out.set(src.subarray(y * stride, y * stride + rowBytes), y * rowBytes);
    }
  }
  return out;
}

export async function compressImages(bytes, opts = {}) {
  const mupdf = await loadMupdf();
  return compressImagesWith(mupdf, bytes, opts);
}

// Split out from compressImages so it can be exercised with a locally-loaded MuPDF
// in tests — the wrapper above pulls MuPDF from a CDN, which only works in a browser.
export function compressImagesWith(mupdf, bytes, { dpi = 150, quality = 75, onProgress } = {}) {
  const maxEdge = maxEdgeForDpi(dpi);

  const doc = mupdf.PDFDocument.openDocument(bytes, 'application/pdf');
  try {
    const total = doc.countObjects();

    // First pass: record every object referenced as an image soft mask (/SMask).
    // The main loop re-encodes those masks losslessly (Flate) rather than through
    // the JPEG path — lossy compression of an alpha mask produces halos around the
    // edges of logos and other transparent artwork.
    const smaskNums = new Set();
    for (let num = 1; num < total; num++) {
      try {
        const o = doc.newIndirect(num).resolve();
        if (!o || !o.isDictionary()) continue;
        const st = o.get('Subtype');
        if (!st || !st.isName() || st.asName() !== 'Image') continue;
        const sm = o.get('SMask');
        if (sm && sm.isIndirect && sm.isIndirect()) smaskNums.add(sm.asIndirect());
      } catch { /* ignore unreadable objects */ }
    }

    let processed = 0;

    for (let num = 1; num < total; num++) {
      let ref = null, obj = null, img = null, pix = null, scaled = null;
      try {
        ref = doc.newIndirect(num);
        obj = ref.resolve();
        // NB: in this MuPDF build isStream() returns false even for real streams,
        // and stream ops (loadImage/readRawStream/writeRawStream/writeStream) must be
        // called on the indirect `ref`, not the resolved `obj`. Detect images by
        // dict + Subtype.
        if (!obj || !obj.isDictionary()) continue;

        const subtype = obj.get('Subtype');
        if (!subtype || !subtype.isName() || subtype.asName() !== 'Image') continue;

        // Stencil masks (1-bit ImageMask) — leave untouched.
        const imBool = obj.get('ImageMask');
        if (imBool && imBool.isBoolean && imBool.isBoolean() && imBool.asBoolean()) continue;

        const filterObj = obj.get('Filter');
        const isJpeg = filterObj && filterObj.isName && filterObj.isName() && filterObj.asName() === 'DCTDecode';

        const smask = obj.get('SMask');
        const hasSMask = smask && !smask.isNull();
        const isSMask = smaskNums.has(num);

        // ── Transparent assets: downsample + re-encode LOSSLESS Flate, keep alpha ──
        // Instead of skipping images that carry transparency (a colour image with an
        // /SMask, or the soft mask itself), we shrink them and re-encode as Flate,
        // preserving the /SMask link so nothing is flattened onto a background — no
        // white boxes on logos. Scoped to non-JPEG sources (re-Flating a JPEG would
        // grow it) and to genuinely oversized images (scale < 1): downsampling
        // lossless data guarantees a smaller stream without measuring it up front.
        if (isSMask || hasSMask) {
          // A soft mask with a /Matte is premultiplied against a colour; re-encoding
          // it in isolation would shift blended edges, so leave those as-is.
          if (isSMask) {
            const matte = obj.get('Matte');
            if (matte && !matte.isNull()) continue;
          }
          if (isJpeg) continue;

          img = doc.loadImage(ref);
          const w = img.getWidth();
          const h = img.getHeight();
          if (!w || !h) continue;

          const longest = Math.max(w, h);
          const scale = longest > maxEdge ? maxEdge / longest : 1;
          if (scale === 1) continue; // only touch oversized assets

          const nw = Math.max(1, Math.round(w * scale));
          const nh = Math.max(1, Math.round(h * scale));

          pix = img.toPixmap();
          // Transparency lives in the separate /SMask object, so the decoded pixmap is
          // opaque; bail if we ever hit an unexpected alpha plane we can't store raw.
          if (pix.getAlpha && pix.getAlpha()) continue;

          let comps = pix.getNumberOfComponents();
          if (comps > 3) {
            const rgb = pix.convertToColorSpace(mupdf.ColorSpace.DeviceRGB, false);
            pix.destroy();
            pix = rgb;
            comps = 3;
          }

          scaled = pix.warp([[0, 0], [w, 0], [w, h], [0, h]], nw, nh);
          const raw = packSamples(scaled);
          const oc = scaled.getNumberOfComponents();

          obj.put('Width', doc.newInteger(nw));
          obj.put('Height', doc.newInteger(nh));
          obj.put('BitsPerComponent', doc.newInteger(8));
          obj.put('ColorSpace', doc.newName(oc === 1 ? 'DeviceGray' : 'DeviceRGB'));
          obj.delete('Filter');        // stored raw → MuPDF Flate-encodes it at save
          obj.delete('DecodeParms');
          obj.delete('Decode');
          // Deliberately keep /SMask on colour images — that is what preserves alpha.
          ref.writeStream(raw);

          processed++;
          if (onProgress) onProgress(`Resizing transparent assets… (${processed} optimized)`);
          continue;
        }

        // ── Opaque images: downsample + re-encode as JPEG ──
        img = doc.loadImage(ref);
        const w = img.getWidth();
        const h = img.getHeight();
        if (!w || !h) continue;

        const longest = Math.max(w, h);
        const scale = longest > maxEdge ? maxEdge / longest : 1;
        const nw = Math.max(1, Math.round(w * scale));
        const nh = Math.max(1, Math.round(h * scale));

        // Nothing to gain: already JPEG and not oversized.
        if (scale === 1 && isJpeg) continue;

        pix = img.toPixmap(); // decodes any encoding MuPDF supports
        if (pix.getAlpha && pix.getAlpha()) continue; // safety: skip alpha pixmaps

        // Normalise colour: CMYK/other → RGB; keep single-channel as grayscale.
        let comps = pix.getNumberOfComponents();
        if (comps > 3) {
          const rgb = pix.convertToColorSpace(mupdf.ColorSpace.DeviceRGB, false);
          pix.destroy();
          pix = rgb;
          comps = 3;
        }

        // Downscale via warp (samples the full-image quad into an nw×nh pixmap).
        if (scale !== 1) {
          scaled = pix.warp([[0, 0], [w, 0], [w, h], [0, h]], nw, nh);
        }
        const outPix = scaled || pix;

        const jpeg = outPix.asJPEG(quality, false);

        // Only commit if it actually shrinks the stored (already-encoded) stream.
        const rawBuf = ref.readRawStream();
        const originalLen = typeof rawBuf.getLength === 'function'
          ? rawBuf.getLength()
          : rawBuf.asUint8Array().length;
        try { rawBuf.destroy(); } catch {}
        if (jpeg.length >= originalLen) continue;

        const csName = outPix.getNumberOfComponents() === 1 ? 'DeviceGray' : 'DeviceRGB';
        obj.put('Width', doc.newInteger(nw));
        obj.put('Height', doc.newInteger(nh));
        obj.put('BitsPerComponent', doc.newInteger(8));
        obj.put('ColorSpace', doc.newName(csName));
        obj.put('Filter', doc.newName('DCTDecode'));
        obj.delete('DecodeParms');
        obj.delete('SMask');
        ref.writeRawStream(jpeg);

        processed++;
        if (onProgress) onProgress(`Recompressing images… (${processed} optimized)`);
      } catch (e) {
        // A single unreadable image must not abort the whole job — leave it as-is.
        // eslint-disable-next-line no-console
        console.warn('skip image obj', num, e && e.message);
      } finally {
        if (scaled) try { scaled.destroy(); } catch {}
        if (pix) try { pix.destroy(); } catch {}
        if (img) try { img.destroy(); } catch {}
      }
    }

    if (onProgress) onProgress('Rebuilding & compressing PDF…');
    const outBuf = doc.saveToBuffer('garbage=3,compress=yes');
    const out = outBuf.asUint8Array().slice(); // copy out before we free WASM memory
    outBuf.destroy();
    return out;
  } finally {
    try { doc.destroy(); } catch {}
  }
}

// ---- Extreme: flatten each page to a JPEG (loses text) -------------------------

export async function compressFlatten(bytes, { dpi = 150, quality = 60, onProgress } = {}) {
  const mupdf = await loadMupdf();
  const { PDFDocument } = await import('pdf-lib');

  const src = mupdf.Document.openDocument(bytes, 'application/pdf');
  try {
    const pageCount = src.countPages();
    const outDoc = await PDFDocument.create();
    const matrix = mupdf.Matrix.scale(dpi / 72, dpi / 72);

    for (let i = 0; i < pageCount; i++) {
      if (onProgress) onProgress(`Flattening page ${i + 1} of ${pageCount}…`);
      let page = null, pix = null;
      try {
        page = src.loadPage(i);
        const bounds = page.getBounds(); // [x0, y0, x1, y1] in points
        const wPt = bounds[2] - bounds[0];
        const hPt = bounds[3] - bounds[1];

        pix = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false);
        const jpeg = pix.asJPEG(quality, false);

        const embedded = await outDoc.embedJpg(jpeg);
        const newPage = outDoc.addPage([wPt, hPt]);
        newPage.drawImage(embedded, { x: 0, y: 0, width: wPt, height: hPt });
      } finally {
        if (pix) try { pix.destroy(); } catch {}
        if (page) try { page.destroy(); } catch {}
      }
    }
    return outDoc.save();
  } finally {
    try { src.destroy(); } catch {}
  }
}

// ---- Dispatcher ---------------------------------------------------------------

export const MODES = {
  lossless: { label: 'Lossless', sub: 'Structural cleanup only', engine: 'lossless' },
  balanced: { label: 'Balanced', sub: '150 DPI · text kept', engine: 'images', dpi: 150, quality: 75 },
  high:     { label: 'High Quality', sub: '300 DPI · text kept', engine: 'images', dpi: 300, quality: 82 },
  extreme:  { label: 'Extreme', sub: 'Flatten pages · no text', engine: 'flatten', dpi: 150, quality: 60 },
};

export async function compressPdf(bytes, mode = 'lossless', onProgress) {
  const cfg = MODES[mode] || MODES.lossless;
  let out;
  if (cfg.engine === 'images') out = await compressImages(bytes, { dpi: cfg.dpi, quality: cfg.quality, onProgress });
  else if (cfg.engine === 'flatten') out = await compressFlatten(bytes, { dpi: cfg.dpi, quality: cfg.quality, onProgress });
  else out = await compressLossless(bytes);

  // Never hand back a file larger than the original — some PDFs (already optimized,
  // linearized, or text-only) can grow slightly on re-save. Return the input instead.
  const original = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return out.byteLength >= original.byteLength ? original : out;
}

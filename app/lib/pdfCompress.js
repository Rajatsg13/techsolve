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

export async function compressImages(bytes, { dpi = 150, quality = 75, onProgress } = {}) {
  const mupdf = await loadMupdf();
  const maxEdge = maxEdgeForDpi(dpi);

  const doc = mupdf.PDFDocument.openDocument(bytes, 'application/pdf');
  try {
    const total = doc.countObjects();
    let processed = 0;

    for (let num = 1; num < total; num++) {
      let ref = null, obj = null, img = null, pix = null, scaled = null;
      try {
        ref = doc.newIndirect(num);
        obj = ref.resolve();
        // NB: in this MuPDF build isStream() returns false even for real streams,
        // and stream ops (loadImage/readRawStream/writeRawStream) must be called on
        // the indirect `ref`, not the resolved `obj`. Detect images by dict + Subtype.
        if (!obj || !obj.isDictionary()) continue;

        const subtype = obj.get('Subtype');
        if (!subtype || !subtype.isName() || subtype.asName() !== 'Image') continue;

        // Skip stencil masks and images carrying transparency — re-encoding to JPEG
        // (no alpha) would drop the mask and cause visible artifacts.
        const imBool = obj.get('ImageMask');
        if (imBool && imBool.isBoolean && imBool.isBoolean() && imBool.asBoolean()) continue;
        const smask = obj.get('SMask');
        if (smask && !smask.isNull()) continue;

        img = doc.loadImage(ref);
        const w = img.getWidth();
        const h = img.getHeight();
        if (!w || !h) continue;

        const longest = Math.max(w, h);
        const scale = longest > maxEdge ? maxEdge / longest : 1;
        const nw = Math.max(1, Math.round(w * scale));
        const nh = Math.max(1, Math.round(h * scale));

        const filterObj = obj.get('Filter');
        const isJpeg = filterObj && filterObj.isName && filterObj.isName() && filterObj.asName() === 'DCTDecode';
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

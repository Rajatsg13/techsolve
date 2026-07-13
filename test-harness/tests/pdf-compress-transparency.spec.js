// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const os = require('os');
const fs = require('fs');
const zlib = require('zlib');
const { pathToFileURL } = require('url');

/**
 * Integration test for the transparency-preserving image path in
 * app/lib/pdfCompress.js (compressImagesWith).
 * Tag: @compress
 *
 * Runs the REAL compression engine in Node against a synthetic PDF that mixes a
 * transparent asset (colour image + /SMask) with an opaque photographic image,
 * and asserts that:
 *   - transparent colour images are downsampled and re-encoded LOSSLESS (Flate),
 *     keeping their /SMask link (no flatten → no "white box" on logos),
 *   - their soft masks are also downsampled and kept as Flate (crisp alpha),
 *   - the alpha channel survives intact (full 0..255 range preserved),
 *   - opaque images still take the JPEG (DCTDecode) path,
 *   - the file gets smaller and the page still renders.
 *
 * No browser is used. MuPDF + pdf-lib are loaded from the app's node_modules, and
 * the module under test is copied to a temp .mjs each run so it always reflects
 * the live source (the app package is CommonJS; the module is authored in ESM).
 */

const ROOT = path.resolve(__dirname, '..', '..'); // techsolve44/
const MUPDF_DIST = path.join(ROOT, 'node_modules', 'mupdf', 'dist', 'mupdf.js');
const SRC = path.join(ROOT, 'app', 'lib', 'pdfCompress.js');

const W = 2000; // longest edge > maxEdge(150dpi)=round(150*11.69)=1754 → must downsample
const H = 1500;

// --- minimal PNG encoder (RGBA when alpha, else RGB) ---------------------------
const crc32 = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

// alpha=true → left half opaque, right half fully transparent (hard edge).
// alpha=false → deterministic photographic-style noise (so JPEG beats Flate).
function makePNG(w, h, alpha) {
  const ch = alpha ? 4 : 3;
  const raw = Buffer.alloc(h * (1 + w * ch));
  for (let y = 0; y < h; y++) {
    const ro = y * (1 + w * ch);
    raw[ro] = 0; // filter type 0
    for (let x = 0; x < w; x++) {
      const o = ro + 1 + x * ch;
      if (alpha) {
        const left = x < w / 2;
        raw[o] = left ? 220 : 30;
        raw[o + 1] = 40;
        raw[o + 2] = left ? 40 : 200;
        raw[o + 3] = left ? 255 : 0;
      } else {
        const r = (x * 2654435761 ^ y * 40503) >>> 0;
        raw[o] = r & 255;
        raw[o + 1] = (r >> 8) & 255;
        raw[o + 2] = (r >> 16) & 255;
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = alpha ? 6 : 2; // colour type: 6=RGBA, 2=RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

let mupdf;
let PDFDocument;
let compressImagesWith;
let tmpModule;

test.beforeAll(async () => {
  const mm = await import(pathToFileURL(MUPDF_DIST).href);
  mupdf = mm.default ?? mm;
  ({ PDFDocument } = require(path.join(ROOT, 'node_modules', 'pdf-lib')));

  // Load the real module as ESM without duplicating it: copy to a temp .mjs so
  // Node treats it as ESM (the app package.json is CommonJS). compressImagesWith
  // has no top-level imports and never touches the CDN, so this is side-effect free.
  tmpModule = path.join(os.tmpdir(), `pdfCompress.itest.${process.pid}.mjs`);
  fs.copyFileSync(SRC, tmpModule);
  ({ compressImagesWith } = await import(pathToFileURL(tmpModule).href));
});

test.afterAll(() => {
  try { fs.unlinkSync(tmpModule); } catch { /* ignore */ }
});

test.describe('@compress transparency-preserving image downsampling', () => {
  test('re-encodes transparent assets as Flate + keeps alpha; opaque stays JPEG', async () => {
    // --- build a PDF: one transparent image, one opaque photo ---
    const pdf = await PDFDocument.create();
    const tImg = await pdf.embedPng(makePNG(W, H, true));
    const oImg = await pdf.embedPng(makePNG(W, H, false));
    const pg = pdf.addPage([1200, 800]);
    pg.drawImage(tImg, { x: 0, y: 0, width: 600, height: 800 });
    pg.drawImage(oImg, { x: 600, y: 0, width: 600, height: 800 });
    const inBytes = await pdf.save();

    // --- run the real engine (Balanced settings) ---
    const outBytes = compressImagesWith(mupdf, inBytes, { dpi: 150, quality: 75 });
    expect(outBytes.length).toBeLessThan(inBytes.length);

    // --- inspect output images ---
    const re = mupdf.PDFDocument.openDocument(outBytes, 'application/pdf');
    const images = [];
    const n = re.countObjects();
    for (let i = 1; i < n; i++) {
      let o;
      try { o = re.newIndirect(i).resolve(); } catch { continue; }
      if (!o || !o.isDictionary()) continue;
      const st = o.get('Subtype');
      if (!st || !st.isName() || st.asName() !== 'Image') continue;
      const f = o.get('Filter');
      const sm = o.get('SMask');
      images.push({
        i,
        filter: f && f.isName && f.isName() ? f.asName() : String(f),
        width: o.get('Width').asNumber(),
        smaskNum: sm && sm.isIndirect && sm.isIndirect() ? sm.asIndirect() : null,
      });
    }

    const transBase = images.find((im) => im.smaskNum != null);
    expect(transBase, 'transparent colour image present with /SMask').toBeTruthy();
    const smaskImg = images.find((im) => im.i === transBase.smaskNum);
    expect(smaskImg, 'soft-mask image present').toBeTruthy();
    const opaque = images.find((im) => im !== transBase && im !== smaskImg);
    expect(opaque, 'opaque image present').toBeTruthy();

    // Transparent colour image: downsampled, lossless Flate, alpha link kept.
    expect(transBase.filter).toBe('FlateDecode');
    expect(transBase.width).toBeLessThan(W);
    // Soft mask: downsampled, lossless Flate (no JPEG halos).
    expect(smaskImg.filter).toBe('FlateDecode');
    expect(smaskImg.width).toBeLessThan(W);
    // Opaque photo: still JPEG.
    expect(opaque.filter).toBe('DCTDecode');
    expect(opaque.width).toBeLessThan(W);

    // Alpha survived intact: the hard opaque/transparent edge spans full 0..255.
    const smPix = re.loadImage(re.newIndirect(transBase.smaskNum)).toPixmap();
    expect(smPix.getNumberOfComponents()).toBe(1);
    const px = smPix.getPixels();
    let mn = 255;
    let mx = 0;
    for (let k = 0; k < px.length; k++) {
      if (px[k] < mn) mn = px[k];
      if (px[k] > mx) mx = px[k];
    }
    expect(mn).toBeLessThan(50); // transparent region preserved
    expect(mx).toBeGreaterThan(200); // opaque region preserved

    // Page still renders (no structural corruption).
    const rp = re
      .loadPage(0)
      .toPixmap(mupdf.Matrix.scale(0.25, 0.25), mupdf.ColorSpace.DeviceRGB, false);
    expect(rp.getWidth()).toBeGreaterThan(0);
    expect(rp.getHeight()).toBeGreaterThan(0);
  });
});

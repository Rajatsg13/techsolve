// PDF compression engine.
//
// Two strategies:
//   'lossless' — pdf-lib structural re-save (drops dead objects, writes object
//                streams). Text, images and vectors are all untouched, so the
//                document is byte-for-byte equivalent in appearance. Savings
//                are modest and depend entirely on how wastefully the source
//                PDF was written: an already-optimised file may shrink by
//                only 1–3%, while a bloated export can drop far more.
//   'flatten'  — renders each page to a JPEG at the chosen DPI and rebuilds the
//                document from those images. Large, reliable savings on
//                image-heavy and scanned documents, but text stops being
//                selectable or searchable. Opt-in, and clearly labelled in the UI.
//
// ── Engine history ──────────────────────────────────────────────────────────
// Earlier revisions also offered 'balanced' and 'high' modes, which downsampled
// every embedded image while keeping text selectable. Those were implemented
// with MuPDF (WASM, loaded from a CDN). MuPDF is published under
// AGPL-3.0-or-later, which carries obligations that were not appropriate for
// this project, so the dependency was removed entirely.
//
// That capability — re-encoding image XObjects in place while leaving content
// streams alone — genuinely requires a PDF *editing* engine. pdf-lib cannot do
// it (it does not decode image streams across the range of filters real PDFs
// use), and pdf.js cannot either (it is a renderer, not an editor). The
// flatten mode below is therefore built on pdf.js + Canvas, which are already
// project dependencies under Apache-2.0 and carry no such obligations.
//
// If image-downsampling-with-text-preserved is wanted again, it needs a
// deliberate engine decision. Keep that engine behind this module's exported
// surface (MODES + compressPdf) so the tool page does not need to change.

// ---- Lossless base (pdf-lib) --------------------------------------------------

export async function compressLossless(bytes) {
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.save({ useObjectStreams: true, addDefaultPage: false });
}

// ---- Flatten: render each page to a JPEG (loses text) -------------------------

/**
 * Rasterises every page with pdf.js and rebuilds the PDF from those images.
 *
 * @param {ArrayBuffer|Uint8Array} bytes  Source PDF
 * @param {object}   opts
 * @param {number}   opts.dpi            Render resolution (72 = 1× scale)
 * @param {number}   opts.quality        JPEG quality, 0–100
 * @param {Function} opts.onProgress     Called with a human-readable status string
 */
export async function compressFlatten(bytes, { dpi = 150, quality = 60, onProgress } = {}) {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  const { PDFDocument } = await import('pdf-lib');

  // getDocument transfers the buffer, and the caller still needs the original
  // bytes for the size comparison in compressPdf — hand pdf.js its own copy.
  const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const src = await pdfjsLib.getDocument({ data: input.slice() }).promise;

  try {
    const outDoc = await PDFDocument.create();
    const scale = dpi / 72;

    for (let i = 1; i <= src.numPages; i++) {
      if (onProgress) onProgress(`Compressing page ${i} of ${src.numPages}…`);

      const page = await src.getPage(i);
      // Page size in points, before scaling — the output page keeps these so
      // the flattened document has the same physical dimensions as the source.
      const ptViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const ctx = canvas.getContext('2d');

      // JPEG has no alpha channel, so unpainted areas would encode as black.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // intent: 'print' — display-intent rendering schedules work through
      // requestAnimationFrame, which browsers suspend in hidden tabs. A user who
      // switched tabs mid-compression would otherwise hang indefinitely.
      await page.render({ canvasContext: ctx, viewport, intent: 'print' }).promise;

      const blob = await new Promise((resolve, reject) =>
        canvas.toBlob(
          b => (b ? resolve(b) : reject(new Error(`Could not render page ${i}.`))),
          'image/jpeg',
          Math.min(1, Math.max(0, quality / 100)),
        ));
      const jpegBytes = new Uint8Array(await blob.arrayBuffer());

      const embedded = await outDoc.embedJpg(jpegBytes);
      const newPage = outDoc.addPage([ptViewport.width, ptViewport.height]);
      newPage.drawImage(embedded, {
        x: 0,
        y: 0,
        width: ptViewport.width,
        height: ptViewport.height,
      });

      page.cleanup();

      // Yield between pages so a long document does not lock up the tab.
      await new Promise(res => setTimeout(res, 0));
    }

    return outDoc.save();
  } finally {
    try { await src.destroy(); } catch { /* already torn down */ }
  }
}

// ---- Dispatcher ---------------------------------------------------------------

export const MODES = {
  lossless: { label: 'Lossless', sub: 'Structural cleanup · text kept', engine: 'lossless' },
  flatten:  { label: 'Strong',   sub: 'Flatten pages · no text',        engine: 'flatten', dpi: 150, quality: 60 },
};

export async function compressPdf(bytes, mode = 'lossless', onProgress) {
  const cfg = MODES[mode] || MODES.lossless;
  let out;
  if (cfg.engine === 'flatten') out = await compressFlatten(bytes, { dpi: cfg.dpi, quality: cfg.quality, onProgress });
  else out = await compressLossless(bytes);

  // Never hand back a file larger than the original — some PDFs (already optimized,
  // linearized, or text-only) can grow slightly on re-save. Return the input instead.
  const original = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return out.byteLength >= original.byteLength ? original : out;
}

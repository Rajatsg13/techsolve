/**
 * Shared pdf.js access.
 *
 * pdf-compress, pdf-redact and pdf-to-excel all need to load pdf.js, point it at
 * a worker, and render or read pages. This is that logic in one place.
 *
 * NETWORK NOTE: pdf.js ships its worker as a separate file. The library itself is
 * bundled, but the worker is fetched from unpkg at first use — the same pattern
 * pdf-to-jpg and pdf-ocr already use. Your document is never uploaded; only the
 * worker script travels, and it travels to you.
 */

let _lib = null;

/** Load pdf.js once and configure its worker. */
export async function getPdfjs() {
  if (_lib) return _lib;
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  _lib = pdfjsLib;
  return _lib;
}

/**
 * Open a PDF for reading.
 * getDocument transfers the buffer it is given, so callers that still need the
 * original bytes should pass a copy — this helper makes one for safety.
 */
export async function openPdf(bytes) {
  const pdfjsLib = await getPdfjs();
  const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return pdfjsLib.getDocument({ data: input.slice() }).promise;
}

/**
 * Render one page to a canvas at the given DPI.
 *
 * `intent: 'print'` matters: display-intent rendering is scheduled through
 * requestAnimationFrame, which browsers suspend in background tabs, so a user
 * who switches tabs mid-job would otherwise hang forever.
 *
 * @returns {{canvas: HTMLCanvasElement, widthPt: number, heightPt: number}}
 */
export async function renderPageToCanvas(page, dpi = 150) {
  const scale = dpi / 72;
  const ptViewport = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext('2d');

  // JPEG has no alpha, so unpainted areas would otherwise encode as black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport, intent: 'print' }).promise;

  return { canvas, widthPt: ptViewport.width, heightPt: ptViewport.height };
}

/** Canvas -> JPEG bytes. */
export async function canvasToJpeg(canvas, quality = 0.85) {
  const blob = await new Promise((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error('Could not encode page image.'))), 'image/jpeg', quality));
  return new Uint8Array(await blob.arrayBuffer());
}

/** Positioned text items for one page, y measured from the top. */
export async function getPageTextItems(page) {
  const viewport = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  return tc.items
    .filter(i => i.str.trim().length > 0)
    .map(i => {
      const t = i.transform;
      return {
        text: i.str,
        x: t[4],
        y: viewport.height - t[5],
        width: i.width,
        height: Math.abs(t[3]) || i.height || 12,
        fontSize: Math.round(Math.abs(t[0]) || Math.abs(t[3]) || 12),
      };
    })
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

/** Yield to the event loop so long page loops do not lock the tab. */
export const yieldToBrowser = () => new Promise(res => setTimeout(res, 0));

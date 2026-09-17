/**
 * Page thumbnails and geometry for the interactive PDF tools.
 *
 * Rotate, Sign and Redact all need the same thing: open a PDF, show the user
 * what each page looks like, and map a click on that picture back to a
 * coordinate in the real page. This owns that, so the three tools only contain
 * what is actually different about them.
 *
 * Coordinate systems, because mixing them up is the usual source of bugs here:
 *   - pdf.js viewports are top-left origin, y increasing downwards
 *   - pdf-lib pages are bottom-left origin, y increasing upwards
 * `toPdfRect` converts between them.
 */

import { openPdf, renderPageToCanvas, yieldToBrowser } from './pdfRender';

/** Thumbnails are small on purpose — a 200-page document should not exhaust memory. */
const THUMB_DPI = 40;

/**
 * Open a PDF and render a thumbnail per page.
 *
 * @param {Uint8Array} bytes
 * @param {(done: number, total: number) => void} [onProgress]
 * @returns {Promise<{pageCount: number, pages: Array<{index, width, height, rotation, thumb, portrait}>}>}
 */
export async function loadPageThumbnails(bytes, onProgress, { dpi = THUMB_DPI, maxPages = 200 } = {}) {
  const doc = await openPdf(bytes);
  const pageCount = doc.numPages;
  if (pageCount > maxPages) {
    throw new Error(`This PDF has ${pageCount} pages. The limit is ${maxPages}.`);
  }

  const pages = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const { canvas } = await renderPageToCanvas(page, dpi);
    pages.push({
      index: i - 1,
      // Dimensions as the page is *displayed*, which already includes any
      // rotation the document itself declares.
      width: viewport.width,
      height: viewport.height,
      rotation: page.rotate || 0,
      portrait: viewport.height >= viewport.width,
      thumb: canvas.toDataURL('image/jpeg', 0.7),
    });
    onProgress?.(i, pageCount);
    await yieldToBrowser();
  }
  return { pageCount, pages };
}

/** Render one page large enough to select regions on. */
export async function renderPageForEditing(bytes, pageIndex, dpi = 110) {
  const doc = await openPdf(bytes);
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale: 1 });
  const { canvas } = await renderPageToCanvas(page, dpi);
  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.85),
    canvas,
    widthPt: viewport.width,
    heightPt: viewport.height,
    rotation: page.rotate || 0,
  };
}

/** Normalise any rotation to one of 0/90/180/270. */
export const normaliseRotation = (deg) => ((Math.round((Number(deg) || 0) / 90) * 90) % 360 + 360) % 360;

/**
 * A rectangle drawn on a displayed page, expressed as fractions of that page
 * (0..1), converted into pdf-lib's bottom-left coordinate space in points.
 *
 * Fractions are used rather than pixels so the same selection survives the
 * preview being displayed at any size — which is what makes the mobile layout
 * and the desktop layout agree.
 */
export function toPdfRect(fraction, widthPt, heightPt) {
  const x = Math.max(0, Math.min(1, fraction.x));
  const y = Math.max(0, Math.min(1, fraction.y));
  const w = Math.max(0, Math.min(1 - x, fraction.width));
  const h = Math.max(0, Math.min(1 - y, fraction.height));
  return {
    x: x * widthPt,
    // Flip: the fraction's y is measured from the top, pdf-lib's from the bottom.
    y: (1 - y - h) * heightPt,
    width: w * widthPt,
    height: h * heightPt,
  };
}

/** Clamp a fractional rectangle to the page, keeping it at least a hair wide. */
export function clampFraction(rect) {
  const w = Math.min(Math.max(rect.width, 0.005), 1);
  const h = Math.min(Math.max(rect.height, 0.005), 1);
  return {
    x: Math.min(Math.max(rect.x, 0), 1 - w),
    y: Math.min(Math.max(rect.y, 0), 1 - h),
    width: w,
    height: h,
  };
}

/** Parse "1, 3, 5-9" into zero-based page indices within a document. */
export function parsePageRange(input, pageCount) {
  const text = String(input || '').trim();
  if (!text) return [];
  const out = new Set();
  for (const part of text.split(',')) {
    const chunk = part.trim();
    if (!chunk) continue;
    const range = /^(\d+)\s*[-–]\s*(\d+)$/.exec(chunk);
    if (range) {
      const a = Number(range[1]), b = Number(range[2]);
      for (let n = Math.min(a, b); n <= Math.max(a, b); n++) {
        if (n >= 1 && n <= pageCount) out.add(n - 1);
      }
      continue;
    }
    const single = Number(chunk);
    if (Number.isInteger(single) && single >= 1 && single <= pageCount) out.add(single - 1);
  }
  return [...out].sort((a, b) => a - b);
}

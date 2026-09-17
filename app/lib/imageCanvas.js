/**
 * Canvas-side image work: decoding a file, re-encoding it, cropping it.
 *
 * Separate from app/lib/image.js, which holds the geometry and stays pure.
 * Everything here touches browser APIs and so is exercised in the browser
 * tests rather than in Node.
 */

import { fitCanvasLimits, fitWithin, getFormat, px } from './image';

/**
 * Decode a file into something drawable.
 *
 * `createImageBitmap` is preferred: it decodes off the main thread, so a large
 * photo does not freeze the tab — the failure mode reported against the PDF
 * tools earlier. Falls back to an <img> for browsers that reject the blob.
 */
export async function decodeImage(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close?.() };
    } catch {
      /* fall through — Safari historically refused some blobs here */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('The file could not be read as an image.'));
      el.src = url;
    });
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/** Draw onto a fresh canvas, filling white first when the format has no alpha. */
function paint(source, sx, sy, sw, sh, dw, dh, formatId) {
  const canvas = document.createElement('canvas');
  canvas.width = px(dw);
  canvas.height = px(dh);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // Without this, a transparent PNG flattened to JPEG comes out with black
  // where the transparency was.
  if (!getFormat(formatId).mime.includes('png')) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Canvas -> Blob, as a promise, with a clear error instead of a null blob. */
export function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error(`This browser could not produce a ${mime} file.`)),
      mime,
      quality,
    );
  });
}

/**
 * Re-encode an image, optionally scaling it down first.
 *
 * @param {object} decoded   from decodeImage
 * @param {object} opts      { formatId, quality 0..1, maxWidth, maxHeight }
 * @returns {Promise<{blob: Blob, width: number, height: number}>}
 */
export async function encodeImage(decoded, { formatId = 'jpeg', quality = 0.8, maxWidth, maxHeight } = {}) {
  const fitted = fitWithin(decoded.width, decoded.height, maxWidth, maxHeight);
  const safe = fitCanvasLimits(fitted.width, fitted.height);
  const canvas = paint(decoded.source, 0, 0, decoded.width, decoded.height, safe.width, safe.height, formatId);
  const format = getFormat(formatId);
  // PNG ignores the quality argument; passing it is harmless but pointless.
  const blob = await canvasToBlob(canvas, format.mime, format.lossy ? quality : undefined);
  return { blob, width: canvas.width, height: canvas.height };
}

/**
 * Crop a region and encode it.
 * `rect` is in source-image pixels and is assumed already clamped by the
 * geometry helpers in app/lib/image.js.
 */
export async function cropImage(decoded, rect, { formatId = 'jpeg', quality = 0.9 } = {}) {
  const safe = fitCanvasLimits(rect.width, rect.height);
  const canvas = paint(
    decoded.source,
    rect.x, rect.y, rect.width, rect.height,
    safe.width, safe.height,
    formatId,
  );
  const format = getFormat(formatId);
  const blob = await canvasToBlob(canvas, format.mime, format.lossy ? quality : undefined);
  return { blob, width: canvas.width, height: canvas.height };
}

/**
 * Compress towards a target size by trying successively lower quality.
 *
 * There is no way to ask the browser for "about 300 KB", so this searches.
 * It stops as soon as it is under target — a handful of encodes, not a full
 * binary search, because each encode of a large photo costs real time.
 */
export async function compressToTarget(decoded, targetBytes, { formatId = 'jpeg', maxWidth, maxHeight } = {}) {
  const steps = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2];
  let last = null;
  for (const quality of steps) {
    const result = await encodeImage(decoded, { formatId, quality, maxWidth, maxHeight });
    last = { ...result, quality };
    if (result.blob.size <= targetBytes) return { ...last, reachedTarget: true };
  }
  return { ...last, reachedTarget: false };
}

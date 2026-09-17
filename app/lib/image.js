/**
 * Image geometry and format logic.
 *
 * Pure like app/lib/calc.js and app/lib/generators.js — no DOM, no canvas — so
 * crop rectangles, aspect-ratio fitting and scaling can be proved in Node
 * rather than only eyeballed in a preview. The canvas work lives in the pages;
 * everything that can be wrong about a number lives here.
 */

/** Conservative canvas dimension limit shared by modern browsers. */
export const MAX_CANVAS_DIM = 16384;

/** Largest total pixel count we will put on a canvas (~268 MP). Chrome throws above this. */
export const MAX_CANVAS_AREA = 268435456;

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Round to a whole pixel, never below 1 — a zero-dimension canvas throws. */
export const px = (n) => Math.max(1, Math.round(num(n)));

/* ── Aspect ratios ──────────────────────────────────────────────────────── */

/**
 * The ratios offered by the crop tool. `null` means freeform.
 * Values are width/height.
 */
export const ASPECT_RATIOS = [
  { id: 'free',  label: 'Freeform',  value: null },
  { id: '1:1',   label: '1:1 Square', value: 1 },
  { id: '4:3',   label: '4:3',        value: 4 / 3 },
  { id: '3:2',   label: '3:2',        value: 3 / 2 },
  { id: '16:9',  label: '16:9',       value: 16 / 9 },
  { id: '3:4',   label: '3:4 Portrait', value: 3 / 4 },
  { id: '9:16',  label: '9:16 Story',   value: 9 / 16 },
];

export function getAspectRatio(id) {
  return ASPECT_RATIOS.find(r => r.id === id) ?? ASPECT_RATIOS[0];
}

/* ── Crop geometry ──────────────────────────────────────────────────────── */

/**
 * Clamp a crop rectangle so it stays inside the image.
 *
 * Everything is in source-image pixels. A rectangle that starts off-canvas or
 * runs past the edge is moved and then trimmed, in that order, so dragging a
 * selection past the border slides it rather than silently shrinking it.
 */
export function clampCrop(rect, imageW, imageH) {
  const iw = px(imageW), ih = px(imageH);
  let w = Math.min(px(rect.width), iw);
  let h = Math.min(px(rect.height), ih);
  let x = Math.round(num(rect.x));
  let y = Math.round(num(rect.y));

  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x + w > iw) x = iw - w;
  if (y + h > ih) y = ih - h;

  return { x: Math.max(0, x), y: Math.max(0, y), width: w, height: h };
}

/**
 * Fit a crop rectangle to an aspect ratio, keeping it inside the image.
 *
 * The rectangle is adjusted around its own centre so the user's selection does
 * not jump to a corner when they pick a ratio. If the ratio cannot fit at the
 * current size, the rectangle shrinks to the largest size that does fit.
 *
 * @param {object} rect   {x, y, width, height} in image pixels
 * @param {number|null} ratio  width/height, or null for freeform
 */
export function applyAspectRatio(rect, ratio, imageW, imageH) {
  if (!ratio || !Number.isFinite(ratio) || ratio <= 0) return clampCrop(rect, imageW, imageH);

  const iw = px(imageW), ih = px(imageH);
  const cx = num(rect.x) + num(rect.width) / 2;
  const cy = num(rect.y) + num(rect.height) / 2;

  // Start from the current area, reshaped to the target ratio.
  let w = num(rect.width);
  let h = w / ratio;
  if (h > num(rect.height)) { h = num(rect.height); w = h * ratio; }

  // Shrink to fit the image if the reshaped rectangle now overflows.
  if (w > iw) { w = iw; h = w / ratio; }
  if (h > ih) { h = ih; w = h * ratio; }

  return clampCrop({ x: cx - w / 2, y: cy - h / 2, width: w, height: h }, iw, ih);
}

/** The largest rectangle of the given ratio that fits the image, centred. */
export function centredCrop(ratio, imageW, imageH) {
  const iw = px(imageW), ih = px(imageH);
  if (!ratio) return { x: 0, y: 0, width: iw, height: ih };
  let w = iw, h = iw / ratio;
  if (h > ih) { h = ih; w = ih * ratio; }
  return clampCrop({ x: (iw - w) / 2, y: (ih - h) / 2, width: w, height: h }, iw, ih);
}

/** Is this rectangle usable as a crop? Returns a human-readable problem or null. */
export function cropProblem(rect, imageW, imageH) {
  const r = clampCrop(rect, imageW, imageH);
  if (r.width < 1 || r.height < 1) return 'The crop area is too small.';
  if (r.width > px(imageW) || r.height > px(imageH)) return 'The crop area is larger than the image.';
  return null;
}

/* ── Scaling ────────────────────────────────────────────────────────────── */

/**
 * Scale dimensions to fit inside a box, preserving aspect ratio.
 * Never enlarges — compressing an image should not invent pixels.
 */
export function fitWithin(width, height, maxWidth, maxHeight) {
  const w = px(width), h = px(height);
  const mw = maxWidth ? px(maxWidth) : Infinity;
  const mh = maxHeight ? px(maxHeight) : Infinity;
  const scale = Math.min(mw / w, mh / h, 1);
  return { width: px(w * scale), height: px(h * scale), scale };
}

/**
 * Bring dimensions under the browser's canvas limits.
 * Returns the original dimensions untouched when they are already safe.
 */
export function fitCanvasLimits(width, height) {
  let { width: w, height: h } = { width: px(width), height: px(height) };
  if (w <= MAX_CANVAS_DIM && h <= MAX_CANVAS_DIM && w * h <= MAX_CANVAS_AREA) {
    return { width: w, height: h, limited: false };
  }
  const dimScale = Math.min(MAX_CANVAS_DIM / w, MAX_CANVAS_DIM / h, 1);
  w = px(w * dimScale); h = px(h * dimScale);
  if (w * h > MAX_CANVAS_AREA) {
    const areaScale = Math.sqrt(MAX_CANVAS_AREA / (w * h));
    w = px(w * areaScale); h = px(h * areaScale);
  }
  return { width: w, height: h, limited: true };
}

/* ── Formats ────────────────────────────────────────────────────────────── */

/** Output formats the compressor offers. */
export const OUTPUT_FORMATS = [
  { id: 'jpeg', label: 'JPEG', mime: 'image/jpeg', ext: 'jpg', lossy: true },
  { id: 'webp', label: 'WebP', mime: 'image/webp', ext: 'webp', lossy: true },
  { id: 'png',  label: 'PNG',  mime: 'image/png',  ext: 'png',  lossy: false },
];

export function getFormat(id) {
  return OUTPUT_FORMATS.find(f => f.id === id) ?? OUTPUT_FORMATS[0];
}

/**
 * Pick the sensible default output format for an input type.
 * PNG is kept as PNG only when it may carry transparency; photographs land on
 * JPEG, which is what actually makes them smaller.
 */
export function defaultFormatFor(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpeg';
}

/** Does this output format keep an alpha channel? */
export const keepsTransparency = (formatId) => getFormat(formatId).mime === 'image/png';

/** Percentage saved, negative when the output grew. Null when the input was empty. */
export function savingsPercent(originalBytes, newBytes) {
  const o = num(originalBytes);
  if (o <= 0) return null;
  return Math.round(((o - num(newBytes)) / o) * 100);
}

/** Swap a filename's extension, preserving the rest of the name. */
export function retargetFilename(name, ext, suffix = '') {
  const base = String(name || 'image').replace(/\.[^.]+$/, '') || 'image';
  return `${base}${suffix}.${ext}`;
}

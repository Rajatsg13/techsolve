/**
 * Input sanitization utilities for TechSolve44
 * All tools run client-side, so these primarily guard against:
 * - NaN / Infinity entering calculator state
 * - Excessively large numbers causing UI/performance issues
 * - HTML/script injection in text fields
 */

/**
 * Parse a numeric input safely.
 * Returns the clamped number, or `fallback` if the value is invalid.
 */
export function safeNum(value, { min = -Infinity, max = Infinity, fallback = 0 } = {}) {
  const n = parseFloat(value);
  if (!isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Parse an integer input safely.
 */
export function safeInt(value, { min = -Infinity, max = Infinity, fallback = 0 } = {}) {
  const n = parseInt(value, 10);
  if (!isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Strip HTML tags and dangerous characters from a text string.
 * Used for prefix/label text fields in PDF tools.
 */
export function safeText(value, maxLength = 50) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')        // strip HTML tags
    .replace(/[<>"'`]/g, '')        // strip remaining dangerous chars
    .slice(0, maxLength);
}

/**
 * Validate that a value is a positive finite number.
 */
export function isPositiveNum(value) {
  const n = parseFloat(value);
  return isFinite(n) && n > 0;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

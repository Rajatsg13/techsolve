/**
 * Number and currency formatting shared by the calculators and generators.
 * Indian grouping (en-IN) is the default because the audience and the tax
 * rules encoded in these tools are Indian.
 */

export const formatINR = (n, decimals = 2) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  });

export const formatINR0 = (n) => formatINR(n, 0);

export const formatNum = (n, decimals = 2) =>
  Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  });

export const formatPct = (n, decimals = 2) => `${Number(n || 0).toFixed(decimals)}%`;

/**
 * Parse a user-entered number.
 * Returns null rather than NaN or 0 so callers can tell "empty" from "zero" —
 * that distinction matters when zero is a legitimate input.
 */
export function parseNum(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

/** True when every argument is a usable finite number. */
export const allValid = (...vals) => vals.every(v => v !== null && Number.isFinite(v));

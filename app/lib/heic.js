/**
 * HEIC decoding.
 *
 * ── Why a dependency at all ─────────────────────────────────────────────────
 * HEIC is an HEVC-coded image in an ISOBMFF container. Safari on macOS and iOS
 * decodes it natively; Chrome, Edge and Firefox do not, and there is no browser
 * API that will. Every JavaScript decoder in the ecosystem is libheif compiled
 * to asm.js/wasm — there is no MIT-licensed alternative.
 *
 * ── Licence ─────────────────────────────────────────────────────────────────
 * `heic-to` is LGPL-3.0 (it wraps libheif, also LGPL-3.0). This is materially
 * different from the AGPL dependency removed earlier: LGPL permits use in a
 * proprietary application provided the library stays replaceable. It is kept as
 * an unmodified npm module and loaded as its own dynamic chunk — not inlined
 * into application code — which is what keeps that condition satisfied.
 *
 * Note: `heic2any` advertises MIT but bundles libheif into its dist, so its
 * stated licence does not cover the code it actually ships. It was rejected for
 * that reason.
 *
 * ── Cost ────────────────────────────────────────────────────────────────────
 * The decoder is roughly 2.9 MB. It is dynamically imported the first time a
 * file actually needs it, so no other page on the site pays for it, and Safari
 * users usually never download it at all because the native path succeeds.
 */

/** HEIC/HEIF brands found at bytes 8..12 of an ISOBMFF file. */
const HEIC_BRANDS = ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1'];

/**
 * Identify a HEIC file by its container, not its extension.
 *
 * Browsers frequently report an empty MIME type for HEIC, and a file renamed to
 * .jpg is still HEIC inside — so the bytes are the only reliable signal.
 * Returns { isHeic, brand }.
 */
export async function sniffHeic(file) {
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (header.length < 12) return { isHeic: false, brand: null };
  const ascii = (start, end) => String.fromCharCode(...header.slice(start, end));
  if (ascii(4, 8) !== 'ftyp') return { isHeic: false, brand: null };
  const brand = ascii(8, 12).trim();
  return { isHeic: HEIC_BRANDS.includes(brand.toLowerCase()), brand };
}

/**
 * Can this browser decode HEIC on its own?
 *
 * Tested by actually decoding a one-pixel HEIC rather than sniffing the user
 * agent. The result is cached — the probe costs a decode, and the answer cannot
 * change within a session.
 */
let nativeSupport;
export async function hasNativeHeicSupport() {
  if (nativeSupport !== undefined) return nativeSupport;
  if (typeof createImageBitmap !== 'function') { nativeSupport = false; return nativeSupport; }
  try {
    // Minimal HEIC file; Safari decodes it, other engines throw.
    const bytes = Uint8Array.from(atob(ONE_PIXEL_HEIC), c => c.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/heic' }));
    bitmap.close?.();
    nativeSupport = true;
  } catch {
    nativeSupport = false;
  }
  return nativeSupport;
}

/**
 * Decode a HEIC file to a Blob of the requested type.
 *
 * Tries the browser first, because on Safari and iOS that is instant and costs
 * nothing to download. Falls back to the libheif decoder everywhere else.
 *
 * @returns {Promise<{blob: Blob, width: number, height: number, decoder: 'native'|'libheif'}>}
 */
export async function decodeHeic(file, { mime = 'image/jpeg', quality = 0.9 } = {}) {
  if (await hasNativeHeicSupport()) {
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (mime !== 'image/png') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close?.();
      const blob = await new Promise((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('Encoding failed.')), mime, quality));
      return { blob, width: canvas.width, height: canvas.height, decoder: 'native' };
    } catch {
      /* fall through to libheif */
    }
  }

  const { heicTo } = await import('heic-to/next');
  const blob = await heicTo({ blob: file, type: mime, quality });
  // heicTo returns only a Blob, so the dimensions come from decoding the result.
  const bitmap = await createImageBitmap(blob);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close?.();
  return { blob, ...size, decoder: 'libheif' };
}

/** A 1x1 HEIC image, used only to probe native support. */
const ONE_PIXEL_HEIC =
  'AAAAGGZ0eXBoZWljAAAAAG1pZjFoZWljAAAB8m1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAHBpY3QAAAAAAAAAAAAAAAAAAAAADnBpdG0AAAAAAAEAAAAeaWluZgAAAAAAAQAAABBpbmZlAgAAAAABAABodmMxAAABbmlwcnAAAAFJaXBjbwAAAWhodmNDAQNwAAAAAAAAAAAAHvAA/P34+AAADwOgAAEAGEABDAH//wNwAAADAAADAAADAAAeraICoQABACJCAQEDcAAAAwAAAwAAAwAAAx6gIIEFluoJraiQIQAAAwABogABAAlEAcBjjJZgSAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAABdpcG1hAAAAAAAAAAEAAQQBgoOEAAAAGm1kYXQAAAASKAGvQ0dGvJmQAAADAAADAABBAA==';

/**
 * Data & Text transformations.
 *
 * Pure like app/lib/calc.js — no React, no DOM — so the behaviour can be proved
 * in Node. Every function returns a discriminated result rather than throwing:
 *
 *   { ok: true,  value: string, ...extras }
 *   { ok: false, error: string, line?, column?, position? }
 *
 * The error strings are written to be shown to a user directly. "Unexpected
 * token } at line 4" is useful; "SyntaxError" is not.
 */

/* ── JSON ───────────────────────────────────────────────────────────────── */

/**
 * Locate the first syntax error in a JSON string, as a character index.
 *
 * JSON.parse already told us the text is invalid; this works out *where*.
 * We do not rely on the engine's message: V8 reports "at position N" for some
 * failures and the positionless "Unexpected token 'x', \"...\" is not valid
 * JSON" for others, and the format has changed between Node versions. A small
 * scanner over a grammar this size is more reliable than parsing prose.
 *
 * Returns the index of the offending character, or the text length when the
 * document simply ends too early.
 */
export function findJsonErrorIndex(text) {
  let i = 0;
  const n = text.length;
  const ws = () => { while (i < n && ' \t\n\r'.includes(text[i])) i++; };
  const fail = () => { throw { at: i }; };

  const value = () => {
    ws();
    if (i >= n) fail();
    const c = text[i];
    if (c === '{') return object();
    if (c === '[') return array();
    if (c === '"') return string();
    if (c === '-' || (c >= '0' && c <= '9')) return number();
    for (const lit of ['true', 'false', 'null']) {
      if (text.startsWith(lit, i)) { i += lit.length; return; }
    }
    fail();
  };

  const string = () => {
    i++; // opening quote
    while (i < n) {
      const c = text[i];
      if (c === '\\') {
        i++;
        if (i >= n) fail();
        if (!'"\\/bfnrtu'.includes(text[i])) fail();
        if (text[i] === 'u') {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(i + 1, i + 5))) { i++; fail(); }
          i += 4;
        }
        i++;
        continue;
      }
      if (c === '"') { i++; return; }
      // Raw control characters are not allowed inside JSON strings.
      if (c < ' ') fail();
      i++;
    }
    fail(); // unterminated
  };

  const number = () => {
    const start = i;
    if (text[i] === '-') i++;
    while (i < n && text[i] >= '0' && text[i] <= '9') i++;
    if (text[i] === '.') { i++; while (i < n && text[i] >= '0' && text[i] <= '9') i++; }
    if (text[i] === 'e' || text[i] === 'E') {
      i++;
      if (text[i] === '+' || text[i] === '-') i++;
      while (i < n && text[i] >= '0' && text[i] <= '9') i++;
    }
    if (i === start) fail();
  };

  const object = () => {
    i++; ws();
    if (text[i] === '}') { i++; return; }
    for (;;) {
      ws();
      if (text[i] !== '"') fail();
      string(); ws();
      if (text[i] !== ':') fail();
      i++; value(); ws();
      if (text[i] === ',') { i++; continue; }
      if (text[i] === '}') { i++; return; }
      fail();
    }
  };

  const array = () => {
    i++; ws();
    if (text[i] === ']') { i++; return; }
    for (;;) {
      value(); ws();
      if (text[i] === ',') { i++; continue; }
      if (text[i] === ']') { i++; return; }
      fail();
    }
  };

  try {
    value();
    ws();
    if (i < n) return i;      // trailing junk after a complete value
    return null;              // scanner found nothing wrong
  } catch (e) {
    return Math.min(e.at ?? i, n);
  }
}

/**
 * Turn a JSON parse failure into something a person can act on.
 *
 * Engines report a character offset (or, in V8, sometimes a line/column already).
 * We normalise to line/column and echo the offending line, because "line 12,
 * column 5" beats "position 314" when you are looking at a wall of JSON.
 */
function describeJsonError(err, text) {
  const raw = String(err?.message || 'Invalid JSON');

  // Prefer a position the engine gave us; otherwise find it ourselves. Engine
  // message formats differ between versions, the scanner does not.
  const posMatch = /position (\d+)/i.exec(raw);
  let position = posMatch ? Number(posMatch[1]) : findJsonErrorIndex(text);

  let line = null, column = null, snippet = null;
  if (position !== null && position !== undefined) {
    const upTo = text.slice(0, position);
    line = upTo.split('\n').length;
    column = position - (upTo.lastIndexOf('\n') + 1) + 1;
    snippet = (text.split('\n')[line - 1] || '').slice(0, 160);
  }

  // Keep the engine's description of *what* is wrong, drop its position noise;
  // we present location ourselves and more usefully.
  let message = raw
    .replace(/\s*in JSON at position \d+.*$/i, '')
    .replace(/,\s*"[\s\S]*?"\s*is not valid JSON\s*$/i, '')
    .replace(/\s*is not valid JSON\s*$/i, '')
    .replace(/^JSON\.parse:\s*/i, '')
    .trim();
  if (!message) message = 'Invalid JSON';
  if (line) message += ` (line ${line}, column ${column})`;

  return { ok: false, error: message, line, column, position, snippet };
}

/** Pretty-print JSON with the given indent. */
export function formatJson(text, indent = 2) {
  if (!text.trim()) return { ok: false, error: 'Nothing to format — paste some JSON first.' };
  try {
    const parsed = JSON.parse(text);
    return { ok: true, value: JSON.stringify(parsed, null, indent), parsed };
  } catch (err) {
    return describeJsonError(err, text);
  }
}

/** Strip all optional whitespace. */
export function minifyJson(text) {
  if (!text.trim()) return { ok: false, error: 'Nothing to minify — paste some JSON first.' };
  try {
    const parsed = JSON.parse(text);
    return { ok: true, value: JSON.stringify(parsed), parsed };
  } catch (err) {
    return describeJsonError(err, text);
  }
}

/**
 * Validate without reformatting, and report a little about the shape —
 * enough to confirm you pasted what you thought you pasted.
 */
export function validateJson(text) {
  if (!text.trim()) return { ok: false, error: 'Nothing to validate — paste some JSON first.' };
  try {
    const parsed = JSON.parse(text);
    return {
      ok: true,
      value: text,
      parsed,
      type: Array.isArray(parsed) ? 'array' : parsed === null ? 'null' : typeof parsed,
      topLevelKeys: parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? Object.keys(parsed).length : null,
      arrayLength: Array.isArray(parsed) ? parsed.length : null,
      depth: jsonDepth(parsed),
    };
  } catch (err) {
    return describeJsonError(err, text);
  }
}

/** Maximum nesting depth, used only for the validation summary. */
export function jsonDepth(value, current = 1) {
  if (value === null || typeof value !== 'object') return current - 1;
  const children = Array.isArray(value) ? value : Object.values(value);
  if (!children.length) return current;
  return Math.max(...children.map(v => jsonDepth(v, current + 1)));
}

/* ── Base64 ─────────────────────────────────────────────────────────────── */

/**
 * Encode UTF-8 text to Base64.
 *
 * btoa alone throws on any character above U+00FF, so text is UTF-8 encoded
 * first. Without this, "café" or any Indic/CJK text fails outright.
 */
export function encodeBase64(text, { urlSafe = false } = {}) {
  if (text === '') return { ok: false, error: 'Nothing to encode — enter some text first.' };
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    let out = btoa(binary);
    if (urlSafe) out = out.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return { ok: true, value: out };
  } catch (err) {
    return { ok: false, error: 'Could not encode this text: ' + (err?.message || 'unknown error') };
  }
}

/**
 * Decode Base64 back to UTF-8 text.
 *
 * Accepts URL-safe input and missing padding, since both are common in tokens
 * people paste in. Rejects anything with characters outside the alphabet, and
 * rejects byte sequences that are not valid UTF-8 — decoding a PNG to "text"
 * should be an error, not mojibake.
 */
export function decodeBase64(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return { ok: false, error: 'Nothing to decode — paste some Base64 first.' };

  let normalised = trimmed.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalised)) {
    return { ok: false, error: 'This is not valid Base64 — it contains characters outside the Base64 alphabet.' };
  }
  const pad = normalised.length % 4;
  if (pad === 1) return { ok: false, error: 'This is not valid Base64 — the input length is not a valid Base64 length.' };
  if (pad) normalised += '='.repeat(4 - pad);

  try {
    const binary = atob(normalised);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const value = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { ok: true, value, byteLength: bytes.length };
  } catch (err) {
    if (err instanceof TypeError) {
      return { ok: false, error: 'This decodes to binary data, not text — it may be an image or a file rather than an encoded string.' };
    }
    return { ok: false, error: 'This is not valid Base64.' };
  }
}

/* ── URL ────────────────────────────────────────────────────────────────── */

/**
 * Percent-encode.
 * 'component' escapes separators such as & = ? / and suits a query value.
 * 'full' preserves them and suits an entire URL.
 */
export function encodeUrl(text, { mode = 'component' } = {}) {
  if (text === '') return { ok: false, error: 'Nothing to encode — enter some text first.' };
  try {
    return { ok: true, value: mode === 'full' ? encodeURI(text) : encodeURIComponent(text) };
  } catch (err) {
    return { ok: false, error: 'Could not encode this text: ' + (err?.message || 'unknown error') };
  }
}

/**
 * Decode percent-encoding.
 * decodeURIComponent throws URIError on a malformed escape such as a lone '%'
 * or '%zz'; that is turned into an explanation naming the offending sequence.
 */
export function decodeUrl(text, { mode = 'component' } = {}) {
  if (!text) return { ok: false, error: 'Nothing to decode — paste an encoded string first.' };
  try {
    return { ok: true, value: mode === 'full' ? decodeURI(text) : decodeURIComponent(text) };
  } catch (err) {
    const bad = /%(?![0-9A-Fa-f]{2})[^\s]{0,2}/.exec(text);
    return {
      ok: false,
      error: bad
        ? `Malformed percent-encoding near "${bad[0]}". A % must be followed by two hex digits — a literal percent sign should be written as %25.`
        : 'This is not a valid percent-encoded string.',
    };
  }
}

/**
 * Split a URL into its parts so a long query string can actually be read.
 * Returns null when the input is not a parseable absolute URL.
 */
export function parseUrlParts(text) {
  try {
    const u = new URL(text.trim());
    return {
      protocol: u.protocol.replace(':', ''),
      host: u.host,
      pathname: u.pathname,
      hash: u.hash ? u.hash.slice(1) : '',
      params: [...u.searchParams.entries()].map(([key, value]) => ({ key, value })),
    };
  } catch {
    return null;
  }
}

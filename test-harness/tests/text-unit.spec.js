// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Unit tests for the Data & Text transformations.
 * Tag: @unit
 *
 * Runs in Node against app/lib/textTools.js. Node has btoa/atob, TextEncoder
 * and URL natively, so no browser is needed.
 */

let T;
test.beforeAll(async () => { T = await import('../../app/lib/textTools.js'); });

test.describe('@unit JSON', () => {
  test('formats compact JSON', () => {
    const r = T.formatJson('{"a":1,"b":[2,3]}');
    expect(r.ok).toBe(true);
    expect(r.value).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
  });

  test('honours a tab indent', () => {
    expect(T.formatJson('{"a":1}', '\t').value).toBe('{\n\t"a": 1\n}');
  });

  test('minifies', () => {
    expect(T.minifyJson('{\n  "a": 1\n}').value).toBe('{"a":1}');
  });

  test('format then minify round-trips', () => {
    const src = '{"z":[1,{"y":null}],"a":"x"}';
    expect(T.minifyJson(T.formatJson(src).value).value).toBe(src);
  });

  test('reports the line and column of a syntax error', () => {
    const bad = '{\n  "a": 1,\n  "b": 2,\n}';
    const r = T.formatJson(bad);
    expect(r.ok).toBe(false);
    expect(r.line).toBe(4);
    expect(r.error).toMatch(/line 4/);
  });

  test('error includes the offending source line', () => {
    const r = T.formatJson('{\n  "a": oops\n}');
    expect(r.ok).toBe(false);
    expect(r.snippet).toContain('oops');
  });

  test('empty input is a friendly message, not a crash', () => {
    expect(T.formatJson('   ').ok).toBe(false);
    expect(T.formatJson('   ').error).toMatch(/paste some JSON/i);
  });

  test('validate summarises an object', () => {
    const r = T.validateJson('{"a":1,"b":{"c":2}}');
    expect(r.ok).toBe(true);
    expect(r.type).toBe('object');
    expect(r.topLevelKeys).toBe(2);
    expect(r.depth).toBe(2);
  });

  test('validate summarises an array', () => {
    const r = T.validateJson('[1,2,3]');
    expect(r.type).toBe('array');
    expect(r.arrayLength).toBe(3);
  });

  test('accepts primitives and null at the top level', () => {
    expect(T.validateJson('42').ok).toBe(true);
    expect(T.validateJson('null').type).toBe('null');
    expect(T.validateJson('"text"').type).toBe('string');
  });

  test('rejects single quotes and trailing commas', () => {
    expect(T.formatJson("{'a':1}").ok).toBe(false);
    expect(T.formatJson('[1,2,]').ok).toBe(false);
  });

  test('handles a large document without error', () => {
    const big = JSON.stringify(Array.from({ length: 20000 }, (_, i) => ({ i, name: `row ${i}` })));
    const r = T.minifyJson(big);
    expect(r.ok).toBe(true);
    expect(r.value.length).toBe(big.length);
  });

  test('preserves unicode', () => {
    const r = T.formatJson('{"a":"café ☕ नमस्ते"}');
    expect(r.ok).toBe(true);
    expect(r.value).toContain('नमस्ते');
  });
});

test.describe('@unit Base64', () => {
  test('encodes ASCII', () => expect(T.encodeBase64('hello').value).toBe('aGVsbG8='));
  test('decodes ASCII', () => expect(T.decodeBase64('aGVsbG8=').value).toBe('hello'));

  test('round-trips UTF-8 beyond Latin-1', () => {
    const src = 'café ☕ नमस्ते 日本語';
    const enc = T.encodeBase64(src);
    expect(enc.ok).toBe(true);
    expect(T.decodeBase64(enc.value).value).toBe(src);
  });

  test('url-safe encoding avoids + / and padding', () => {
    const r = T.encodeBase64('subjects?_d=1&x=/y+z', { urlSafe: true });
    expect(r.value).not.toMatch(/[+/=]/);
  });

  test('decodes url-safe input', () => {
    const src = 'any + slash / value';
    const enc = T.encodeBase64(src, { urlSafe: true });
    expect(T.decodeBase64(enc.value).value).toBe(src);
  });

  test('tolerates missing padding and whitespace', () => {
    expect(T.decodeBase64('aGVsbG8').value).toBe('hello');
    expect(T.decodeBase64('aGVs bG8=\n').value).toBe('hello');
  });

  test('rejects characters outside the alphabet', () => {
    const r = T.decodeBase64('not base64 !!!');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/outside the Base64 alphabet/i);
  });

  test('rejects an impossible length', () => {
    expect(T.decodeBase64('aGVsbG8=A').ok).toBe(false);
  });

  test('rejects binary that is not valid UTF-8 text', () => {
    // PNG magic bytes — valid Base64, but not text.
    const r = T.decodeBase64('iVBORw0KGgo=');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/binary data/i);
  });

  test('empty input is handled', () => {
    expect(T.encodeBase64('').ok).toBe(false);
    expect(T.decodeBase64('   ').ok).toBe(false);
  });
});

test.describe('@unit URL', () => {
  test('component mode escapes separators', () => {
    expect(T.encodeUrl('a b&c=d', { mode: 'component' }).value).toBe('a%20b%26c%3Dd');
  });

  test('full mode preserves URL structure', () => {
    const r = T.encodeUrl('https://x.com/a b?q=1&r=2', { mode: 'full' });
    expect(r.value).toBe('https://x.com/a%20b?q=1&r=2');
  });

  test('decodes', () => {
    expect(T.decodeUrl('a%20b%26c').value).toBe('a b&c');
  });

  test('round-trips unicode', () => {
    const src = 'नमस्ते world/?&=';
    expect(T.decodeUrl(T.encodeUrl(src).value).value).toBe(src);
  });

  test('explains a malformed escape rather than throwing', () => {
    const r = T.decodeUrl('100%');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/%25/);
  });

  test('rejects an invalid hex escape', () => {
    expect(T.decodeUrl('%zz').ok).toBe(false);
  });

  test('a literal percent survives a round trip', () => {
    expect(T.decodeUrl(T.encodeUrl('100% sure').value).value).toBe('100% sure');
  });

  test('parses a URL into parts', () => {
    const p = T.parseUrlParts('https://ex.com/a/b?x=1&y=two#frag');
    expect(p.protocol).toBe('https');
    expect(p.host).toBe('ex.com');
    expect(p.pathname).toBe('/a/b');
    expect(p.hash).toBe('frag');
    expect(p.params).toEqual([{ key: 'x', value: '1' }, { key: 'y', value: 'two' }]);
  });

  test('non-URL input returns null rather than throwing', () => {
    expect(T.parseUrlParts('just text')).toBeNull();
  });

  test('empty input is handled', () => {
    expect(T.encodeUrl('').ok).toBe(false);
    expect(T.decodeUrl('').ok).toBe(false);
  });
});

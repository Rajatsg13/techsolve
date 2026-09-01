// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Unit tests for the shared table detector.
 * Tag: @unit
 *
 * This logic was previously buried in the PDF-to-Word page and had no tests at
 * all. Extracting it for PDF to Excel made it testable, so these lock in the
 * behaviour that was calibrated against real report PDFs.
 *
 * Items are synthesised in the shape pdf.js produces: x, y (top-down),
 * width, height, fontSize.
 */

let T;
test.beforeAll(async () => { T = await import('../../app/lib/pdfTables.js'); });

/** Build one text item. */
const item = (text, x, y, { size = 10, width = null } = {}) => ({
  text, x, y, fontSize: size, height: size,
  width: width ?? text.length * size * 0.5,
});

/** Lay out rows of cells at fixed column positions. */
function grid(rows, cols, { startY = 100, step = 20, size = 10 } = {}) {
  const items = [];
  rows.forEach((row, r) => row.forEach((text, c) => {
    if (text !== null) items.push(item(text, cols[c], startY + r * step, { size }));
  }));
  return items;
}

test.describe('@unit line grouping', () => {
  test('items on the same baseline become one line', () => {
    const lines = T.groupIntoLines([item('a', 10, 100), item('b', 80, 100), item('c', 10, 130)]);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveLength(2);
  });

  test('lines come back ordered left to right', () => {
    const lines = T.groupIntoLines([item('b', 80, 100), item('a', 10, 100)]);
    expect(lines[0].map(i => i.text)).toEqual(['a', 'b']);
  });

  test('a small baseline wobble still counts as one line', () => {
    // Real PDFs rarely place a row at exactly the same y.
    const lines = T.groupIntoLines([item('a', 10, 100), item('b', 80, 101.5)]);
    expect(lines).toHaveLength(1);
  });
});

test.describe('@unit cell tokenising', () => {
  test('a wide gutter splits cells', () => {
    const line = [item('Region', 50, 100), item('Units', 210, 100)];
    expect(T.tokenizeLine(line)).toHaveLength(2);
  });

  test('ordinary word spacing does not split a sentence into cells', () => {
    // This is the bug the thresholds exist to prevent: prose becoming a table.
    const words = 'the quick brown fox jumps over'.split(' ');
    let x = 50;
    const line = words.map(w => { const it = item(w, x, 100); x += it.width + 4; return it; });
    expect(T.tokenizeLine(line)).toHaveLength(1);
  });

  test('token text is joined back together', () => {
    const line = [item('New', 50, 100), item('York', 50 + 3 * 5 + 2, 100)];
    expect(T.tokenizeLine(line)[0].text).toContain('New');
  });
});

test.describe('@unit table block detection', () => {
  const cols = [50, 210, 330, 440];
  const rows = [
    ['Region', 'Units', 'Revenue', 'Growth'],
    ['North', '1240', '285000', '12.5'],
    ['South', '980', '196400', '-3.2'],
    ['East', '1567', '412300', '22.8'],
  ];

  test('finds a consistent grid', () => {
    const lines = T.groupIntoLines(grid(rows, cols));
    const tokens = lines.map(T.tokenizeLine);
    const blocks = T.detectTableBlocks(lines, tokens);
    expect(blocks.length).toBeGreaterThanOrEqual(1);
    expect(blocks[0].columns.length).toBe(4);
  });

  test('extracts the right cell values', () => {
    const lines = T.groupIntoLines(grid(rows, cols));
    const tokens = lines.map(T.tokenizeLine);
    const [block] = T.detectTableBlocks(lines, tokens);
    const out = T.tableRowsForSide(block, tokens).map(r => r.map(c => c.text));
    expect(out[0]).toEqual(['Region', 'Units', 'Revenue', 'Growth']);
    expect(out[1]).toEqual(['North', '1240', '285000', '12.5']);
  });

  test('a block of fewer than three lines is not a table', () => {
    const lines = T.groupIntoLines(grid(rows.slice(0, 2), cols));
    const tokens = lines.map(T.tokenizeLine);
    expect(T.detectTableBlocks(lines, tokens)).toHaveLength(0);
  });

  test('single-column prose is not a table', () => {
    const lines = T.groupIntoLines(grid(
      [['A paragraph of ordinary text'], ['Another line of prose here'], ['And a third line as well']],
      [50],
    ));
    const tokens = lines.map(T.tokenizeLine);
    expect(T.detectTableBlocks(lines, tokens)).toHaveLength(0);
  });

  test('no items produces no tables rather than throwing', () => {
    expect(T.groupIntoLines([])).toEqual([]);
    expect(T.detectTableBlocks([], [])).toEqual([]);
  });
});

test.describe('@unit positioned item extraction', () => {
  test('flips pdf.js bottom-up y into top-down', () => {
    const tc = { items: [{ str: 'hi', transform: [10, 0, 0, 10, 20, 700], width: 12, height: 10 }] };
    const [out] = T.extractPositionedItems(tc, 842);
    expect(out.y).toBe(842 - 700);
    expect(out.x).toBe(20);
  });

  test('blank items are dropped', () => {
    const tc = { items: [
      { str: '   ', transform: [10, 0, 0, 10, 20, 700], width: 5, height: 10 },
      { str: 'real', transform: [10, 0, 0, 10, 20, 680], width: 20, height: 10 },
    ] };
    expect(T.extractPositionedItems(tc, 842)).toHaveLength(1);
  });
});

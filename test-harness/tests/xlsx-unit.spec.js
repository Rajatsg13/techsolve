// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Unit tests for the XLSX writer's value and naming logic.
 * Tag: @unit
 *
 * The zip/XML assembly is proved end to end by opening real workbooks with a
 * spreadsheet library; these cover the decisions that are easy to get wrong.
 */

let X;
test.beforeAll(async () => { X = await import('../../app/lib/xlsx.js'); });

test.describe('@unit xlsx column references', () => {
  test('single letters', () => {
    expect(X.columnLetter(0)).toBe('A');
    expect(X.columnLetter(25)).toBe('Z');
  });
  test('rolls over into two letters', () => {
    expect(X.columnLetter(26)).toBe('AA');
    expect(X.columnLetter(27)).toBe('AB');
    expect(X.columnLetter(51)).toBe('AZ');
    expect(X.columnLetter(52)).toBe('BA');
  });
  test('cell references are 1-based on rows', () => {
    expect(X.cellRef(0, 0)).toBe('A1');
    expect(X.cellRef(9, 2)).toBe('C10');
  });
});

test.describe('@unit xlsx number detection', () => {
  test('plain numbers convert', () => {
    expect(X.toNumber('42')).toBe(42);
    expect(X.toNumber('-3.5')).toBe(-3.5);
    expect(X.toNumber(' 7 ')).toBe(7);
  });
  test('thousands separators and currency are handled', () => {
    expect(X.toNumber('1,234')).toBe(1234);
    expect(X.toNumber('₹1,500.50')).toBe(1500.5);
    expect(X.toNumber('$99')).toBe(99);
  });
  test('accounting parentheses mean negative', () => {
    expect(X.toNumber('(1,234)')).toBe(-1234);
  });
  test('identifiers that merely look numeric stay text', () => {
    // Converting these would corrupt real data — a leading zero is significant.
    expect(X.toNumber('007')).toBe(null);
    expect(X.toNumber('1e5')).toBe(null);
    expect(X.toNumber('2024-01-01')).toBe(null);
    expect(X.toNumber('SKU-1001')).toBe(null);
  });
  test('empty and non-numeric give null', () => {
    expect(X.toNumber('')).toBe(null);
    expect(X.toNumber('   ')).toBe(null);
    expect(X.toNumber('total')).toBe(null);
    expect(X.toNumber(null)).toBe(null);
  });
  test('real numbers pass through', () => {
    expect(X.toNumber(12.5)).toBe(12.5);
    expect(X.toNumber(NaN)).toBe(null);
    expect(X.toNumber(Infinity)).toBe(null);
  });
});

test.describe('@unit xlsx escaping', () => {
  test('escapes the XML metacharacters', () => {
    expect(X.escapeXml('a & b')).toBe('a &amp; b');
    expect(X.escapeXml('<tag>')).toBe('&lt;tag&gt;');
    expect(X.escapeXml('say "hi"')).toBe('say &quot;hi&quot;');
  });
  test('strips control characters that would break the file', () => {
    expect(X.escapeXml('a\x00b\x07c')).toBe('abc');
  });
  test('keeps legal whitespace', () => {
    expect(X.escapeXml('a\tb\nc')).toBe('a\tb\nc');
  });
});

test.describe('@unit xlsx sheet names', () => {
  test('replaces characters Excel forbids', () => {
    expect(X.safeSheetName('Sales/Q1:2026')).toBe('Sales Q1 2026');
    expect(X.safeSheetName('a[b]c*d?e')).toBe('a b c d e');
  });
  test('truncates to the 31-character limit', () => {
    expect(X.safeSheetName('x'.repeat(50)).length).toBe(31);
  });
  test('an empty name still produces something valid', () => {
    expect(X.safeSheetName('')).toBe('Sheet');
    expect(X.safeSheetName('   ')).toBe('Sheet');
  });
  test('duplicates are disambiguated', () => {
    expect(X.safeSheetName('Table', ['Table'])).toBe('Table (2)');
    expect(X.safeSheetName('Table', ['Table', 'Table (2)'])).toBe('Table (3)');
  });
  test('a long duplicate still fits the limit', () => {
    expect(X.safeSheetName('y'.repeat(31), ['y'.repeat(31)]).length).toBeLessThanOrEqual(31);
  });
});

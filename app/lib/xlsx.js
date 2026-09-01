/**
 * Minimal XLSX writer.
 *
 * ── Why hand-rolled ─────────────────────────────────────────────────────────
 * An .xlsx file is a zip of a handful of XML parts, and what this site needs to
 * write is plain values in plain grids — no formulas, no charts, no styling
 * beyond a bold header row. The alternatives were all worse for that job:
 *
 *   exceljs        MIT, but ~22 MB installed and a large browser bundle
 *   write-excel-file  MIT, ~2.7 MB, still far more than this needs
 *   xlsx (SheetJS) the npm-published 0.18.5 is stale and carries a known
 *                  prototype-pollution advisory; fixed releases are published
 *                  only to the vendor's own CDN, not npm
 *
 * jszip was already in the tree (docx depends on it) and is dual licensed
 * MIT OR GPL-3.0-or-later, so the MIT terms apply. It is now declared as a
 * direct dependency rather than relied on transitively.
 *
 * ── Format notes ────────────────────────────────────────────────────────────
 * Strings are written inline (t="inlineStr") rather than through a shared
 * string table. That is slightly larger on disk but removes a whole class of
 * index-mismatch bugs, and every reader — Excel, LibreOffice, Numbers, openpyxl
 * — handles it.
 */

/** Escape the five XML metacharacters. */
export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // Control characters are illegal in XML 1.0 and make the workbook
    // unopenable; tab, newline and carriage return are the legal exceptions.
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

/** 0 -> A, 25 -> Z, 26 -> AA. */
export function columnLetter(index) {
  let n = Math.max(0, Math.floor(index)), s = '';
  do { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; } while (n >= 0);
  return s;
}

/** "A1"-style reference for a zero-based row and column. */
export const cellRef = (row, col) => `${columnLetter(col)}${row + 1}`;

/**
 * Should this value be written as a number?
 *
 * Deliberately conservative. A value only becomes numeric when it round-trips
 * exactly, so identifiers that merely look numeric — "007", "1e5", phone
 * numbers with spaces — stay text instead of being silently mangled. Thousands
 * separators and a trailing/leading currency symbol are still recognised,
 * because those are overwhelmingly real numbers in an extracted table.
 */
export function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  // Strip currency symbols, thousands separators, and a trailing percent.
  let s = raw.replace(/[₹$€£¥]/g, '').replace(/,/g, '').trim();
  const negativeParens = /^\((.*)\)$/.exec(s);          // (1,234) means -1234 in finance
  if (negativeParens) s = '-' + negativeParens[1];
  if (!/^[-+]?\d*\.?\d+$/.test(s)) return null;         // no exponents: keeps "1e5" as text
  if (/^[-+]?0\d/.test(s)) return null;                 // leading zero: an identifier, not a number

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Excel forbids these in sheet names, caps them at 31 chars, and rejects empty. */
export function safeSheetName(name, taken = []) {
  let base = String(name || 'Sheet').replace(/[:\\/?*[\]]/g, ' ').trim().slice(0, 31) || 'Sheet';
  let candidate = base, n = 2;
  while (taken.includes(candidate)) {
    const suffix = ` (${n++})`;
    candidate = base.slice(0, 31 - suffix.length) + suffix;
  }
  return candidate;
}

function sheetXml(rows, { headerRow = false } = {}) {
  const body = rows.map((row, r) => {
    const cells = (row || []).map((value, c) => {
      const ref = cellRef(r, c);
      if (value === null || value === undefined || value === '') return '';
      const num = toNumber(value);
      const style = headerRow && r === 0 ? ' s="1"' : '';
      return num !== null
        ? `<c r="${ref}"${style}><v>${num}</v></c>`
        : `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    }).join('');
    return `<row r="${r + 1}">${cells}</row>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

/**
 * Build an .xlsx file.
 *
 * @param {Array<{name: string, rows: Array<Array<string|number>>}>} sheets
 * @returns {Promise<Blob>}
 */
export async function buildXlsx(sheets, { headerRow = true } = {}) {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  const used = [];
  const clean = (sheets || []).filter(s => s && Array.isArray(s.rows)).map(s => {
    const name = safeSheetName(s.name, used);
    used.push(name);
    return { name, rows: s.rows };
  });
  if (!clean.length) throw new Error('There is nothing to write to a spreadsheet.');

  zip.file('[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${clean.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('\n')}
</Types>`);

  zip.file('_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);

  zip.file('xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${clean.map((s, i) => `<sheet name="${escapeXml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>
</workbook>`);

  zip.file('xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${clean.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('\n')}
<Relationship Id="rId${clean.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

  // Two cell formats: 0 is default, 1 is bold — used for the header row.
  zip.file('xl/styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="1"><fill><patternFill patternType="none"/></fill></fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`);

  clean.forEach((s, i) => zip.file(`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s.rows, { headerRow })));

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    compression: 'DEFLATE',
  });
}

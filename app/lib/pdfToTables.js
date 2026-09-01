/**
 * Turn a PDF into table data, using the same detector as PDF to Word.
 *
 * Separated from the page so the extraction can be exercised directly and so
 * PDF to Word and PDF to Excel cannot drift apart.
 */

import { openPdf, yieldToBrowser } from './pdfRender';
import {
  extractPositionedItems, groupIntoLines, tokenizeLine,
  splitTwinTables, tableRowsForSide, detectTableBlocks,
} from './pdfTables';

/**
 * Extract every table found in a PDF.
 *
 * @returns {Promise<{tables: Array<{page:number, rows:string[][]}>, pagesWithText:number, pageCount:number}>}
 */
export async function extractTables(bytes, { onProgress, maxPages = 100 } = {}) {
  const doc = await openPdf(bytes);
  const pageCount = doc.numPages;
  if (pageCount > maxPages) {
    throw new Error(`This PDF has ${pageCount} pages. The limit is ${maxPages}.`);
  }

  const tables = [];
  let pagesWithText = 0;

  for (let i = 1; i <= pageCount; i++) {
    onProgress?.(i, pageCount);
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();

    const items = extractPositionedItems(textContent, viewport.height);
    if (items.length) pagesWithText++;
    if (items.length < 2) { await yieldToBrowser(); continue; }

    const lines = groupIntoLines(items);
    const lineTokens = lines.map(tokenizeLine);
    const blocks = detectTableBlocks(lines, lineTokens);

    for (const block of blocks) {
      for (const part of splitTwinTables(block, lineTokens)) {
        const rows = tableRowsForSide(part, lineTokens)
          .map(cells => {
            // Expand column spans so every row has the same width — a
            // spreadsheet has no notion of a merged cell here, and a ragged
            // grid is what makes values look shifted.
            const flat = [];
            for (const c of cells) {
              flat.push(c.text);
              for (let s = 1; s < (c.span || 1); s++) flat.push('');
            }
            return flat;
          })
          .filter(r => r.some(c => c && c.trim()));

        if (rows.length >= 2 && rows[0].length >= 2) {
          tables.push({ page: i, rows: padRows(rows) });
        }
      }
    }
    await yieldToBrowser();
  }

  return { tables, pagesWithText, pageCount };
}

/** Make every row the same length, so cells never appear shifted. */
export function padRows(rows) {
  const width = rows.reduce((m, r) => Math.max(m, r.length), 0);
  return rows.map(r => {
    const copy = r.slice(0, width);
    while (copy.length < width) copy.push('');
    return copy;
  });
}

/**
 * Should consecutive tables be joined?
 *
 * A table continued across a page break has the same shape and usually repeats
 * its header. Joining those is right; joining two unrelated tables is not, so
 * the test is deliberately strict: identical column count, consecutive pages.
 */
export function mergeContinuations(tables) {
  const out = [];
  for (const t of tables) {
    const prev = out[out.length - 1];
    const sameShape = prev && prev.rows[0].length === t.rows[0].length;
    const consecutive = prev && t.page === prev.lastPage + 1;
    if (sameShape && consecutive) {
      const headerRepeated =
        JSON.stringify(prev.rows[0]).toLowerCase() === JSON.stringify(t.rows[0]).toLowerCase();
      prev.rows.push(...(headerRepeated ? t.rows.slice(1) : t.rows));
      prev.lastPage = t.page;
      prev.pages.push(t.page);
      continue;
    }
    out.push({ rows: [...t.rows], page: t.page, lastPage: t.page, pages: [t.page] });
  }
  return out;
}

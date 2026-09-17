/**
 * Shared PDF document builder for the generators.
 *
 * Invoice, payslip and rent receipt are the same shape of document: an A4 page
 * with a title block, some labelled detail panels, a table, a totals block and
 * a signature line. This owns that vocabulary so the three tools describe what
 * they want rather than each re-implementing text placement.
 *
 * ── The font situation, and why amounts read "Rs." ──────────────────────────
 * pdf-lib's 14 standard fonts are WinAnsi-encoded. WinAnsi has no ₹ (U+20B9)
 * and no Devanagari, so drawing either throws outright. Embedding a Unicode
 * font would fix the symbol but costs roughly 1.1 MB in the repository for two
 * weights, and still would not render Indic names without additional script
 * fonts. So: amounts are written "Rs." and any character the font cannot encode
 * is transliterated or dropped by `sanitise`, which reports what it changed so
 * the UI can warn instead of failing silently. See KNOWN LIMITATIONS in the
 * phase report — this is a deliberate trade-off, not an oversight.
 */

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 48;

/** Ink colours, matching the site palette. */
const COLORS = {
  ink:   [0.075, 0.137, 0.278],
  muted: [0.36, 0.42, 0.52],
  faint: [0.62, 0.67, 0.74],
  rule:  [0.87, 0.90, 0.94],
  brand: [0.106, 0.42, 0.94],
  panel: [0.965, 0.976, 0.988],
};

/**
 * Make text safe for a WinAnsi font.
 * Returns the cleaned string plus whether anything had to be replaced, so the
 * caller can tell the user rather than quietly mangling their data.
 */
export function sanitise(input) {
  const text = String(input ?? '');
  let changed = false;
  const out = text
    .replace(/₹/g, 'Rs.')
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/ /g, ' ')
    .replace(/[^\x20-\xFF\n]/g, (ch) => { changed = true; return ''; });
  return { text: out, changed };
}

/** True when a value contains characters the PDF font cannot represent. */
export function hasUnsupportedCharacters(value) {
  return sanitise(value).changed;
}

/** Money for the PDF. Deliberately "Rs." — see the note at the top of this file. */
export const pdfMoney = (n) =>
  'Rs. ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * A small drawing surface over pdf-lib with a cursor, wrapping and tables.
 * Created by `createDoc`.
 */
class DocBuilder {
  constructor(pdfDoc, fonts) {
    this.pdf = pdfDoc;
    this.fonts = fonts;
    this.page = null;
    this.y = 0;
    this.warnings = false;
    this.addPage();
  }

  addPage() {
    this.page = this.pdf.addPage([A4.width, A4.height]);
    this.y = A4.height - MARGIN;
    return this.page;
  }

  /** Start a new page when there is not enough room left for `needed` points. */
  ensure(needed) {
    if (this.y - needed < MARGIN + 40) this.addPage();
  }

  get contentWidth() { return A4.width - MARGIN * 2; }

  font(weight = 'regular') { return weight === 'bold' ? this.fonts.bold : this.fonts.regular; }

  widthOf(text, size, weight = 'regular') {
    return this.font(weight).widthOfTextAtSize(sanitise(text).text, size);
  }

  /** Draw a single line of text. Returns the y it was drawn at. */
  text(str, { x = MARGIN, y = null, size = 10, weight = 'regular', color = COLORS.ink, align = 'left', width = null } = {}) {
    const { text, changed } = sanitise(str);
    if (changed) this.warnings = true;
    const at = y === null ? this.y : y;
    let drawX = x;
    if (align !== 'left' && width) {
      const w = this.font(weight).widthOfTextAtSize(text, size);
      drawX = align === 'right' ? x + width - w : x + (width - w) / 2;
    }
    this.page.drawText(text, { x: drawX, y: at, size, font: this.font(weight), color: rgbOf(color) });
    return at;
  }

  /**
   * Wrap `str` into `width` and draw it, advancing the cursor.
   * This is what stops a long address from running off the page — the failure
   * mode the brief specifically asked to avoid.
   */
  paragraph(str, { x = MARGIN, width = null, size = 9.5, weight = 'regular', color = COLORS.muted, lineHeight = 1.35, maxLines = null } = {}) {
    const w = width ?? this.contentWidth;
    const lines = this.wrap(str, w, size, weight);
    const use = maxLines ? lines.slice(0, maxLines) : lines;
    for (const line of use) {
      this.ensure(size * lineHeight + 4);
      this.text(line, { x, size, weight, color });
      this.y -= size * lineHeight;
    }
    return use.length;
  }

  /** Break text into lines that fit `width`, honouring existing newlines. */
  wrap(str, width, size, weight = 'regular') {
    const { text, changed } = sanitise(str);
    if (changed) this.warnings = true;
    const font = this.font(weight);
    const out = [];
    for (const rawLine of text.split('\n')) {
      const words = rawLine.split(/\s+/).filter(Boolean);
      if (!words.length) { out.push(''); continue; }
      let line = '';
      for (const word of words) {
        const attempt = line ? line + ' ' + word : word;
        if (font.widthOfTextAtSize(attempt, size) <= width) { line = attempt; continue; }
        if (line) out.push(line);
        // A single word longer than the column has to be broken by character,
        // otherwise it would overflow the cell silently.
        if (font.widthOfTextAtSize(word, size) > width) {
          let chunk = '';
          for (const ch of word) {
            if (font.widthOfTextAtSize(chunk + ch, size) > width) { out.push(chunk); chunk = ch; }
            else chunk += ch;
          }
          line = chunk;
        } else line = word;
      }
      if (line) out.push(line);
    }
    return out;
  }

  rule({ y = null, color = COLORS.rule, thickness = 1, x = MARGIN, width = null } = {}) {
    const at = y === null ? this.y : y;
    this.page.drawLine({
      start: { x, y: at }, end: { x: x + (width ?? this.contentWidth), y: at },
      thickness, color: rgbOf(color),
    });
  }

  box({ x = MARGIN, y, width, height, color = COLORS.panel, borderColor = null }) {
    this.page.drawRectangle({
      x, y, width, height,
      color: rgbOf(color),
      ...(borderColor ? { borderColor: rgbOf(borderColor), borderWidth: 0.8 } : {}),
    });
  }

  space(n = 10) { this.y -= n; }

  /**
   * Draw wrapped text at an absolute y without any page-break check.
   * The footer disclaimer sits at the bottom margin on purpose; routing it
   * through paragraph() made ensure() start a new page on every document.
   */
  paragraphAt(str, { x = MARGIN, y, width = null, size = 7.5, color = COLORS.faint, lineHeight = 1.3 }) {
    const lines = this.wrap(str, width ?? this.contentWidth, size);
    let cursor = y;
    for (const line of lines) {
      this.text(line, { x, y: cursor, size, color });
      cursor -= size * lineHeight;
    }
    return y - cursor;
  }

  /**
   * Table with a header row, wrapped cells and automatic page breaks.
   * @param {Array} columns [{ label, width, align }]
   * @param {Array} rows    array of arrays of strings
   */
  table(columns, rows, { size = 9, headerSize = 8, rowPadding = 6 } = {}) {
    const drawHeader = () => {
      this.ensure(26);
      const top = this.y;
      this.box({ x: MARGIN, y: top - 16, width: this.contentWidth, height: 20, color: COLORS.panel });
      let x = MARGIN + 6;
      columns.forEach(col => {
        this.text(col.label.toUpperCase(), {
          x, y: top - 10, size: headerSize, weight: 'bold', color: COLORS.muted,
          align: col.align || 'left', width: col.width - 12,
        });
        x += col.width;
      });
      this.y = top - 24;
    };

    drawHeader();

    rows.forEach(cells => {
      const wrapped = cells.map((cell, i) => this.wrap(String(cell ?? ''), columns[i].width - 12, size));
      const lineCount = Math.max(...wrapped.map(w => w.length), 1);
      const rowHeight = lineCount * (size * 1.3) + rowPadding;

      if (this.y - rowHeight < MARGIN + 60) { this.addPage(); drawHeader(); }

      const top = this.y;
      let x = MARGIN + 6;
      columns.forEach((col, i) => {
        wrapped[i].forEach((line, li) => {
          this.text(line, {
            x, y: top - (li + 1) * (size * 1.3), size,
            align: col.align || 'left', width: col.width - 12,
            color: COLORS.ink,
          });
        });
        x += col.width;
      });
      this.y = top - rowHeight;
      this.rule({ y: this.y + rowPadding / 2 });
    });
  }

  /** Right-aligned label/value stack used for invoice and payslip totals. */
  totals(rows, { width = 230, labelSize = 9.5 } = {}) {
    const x = A4.width - MARGIN - width;
    rows.filter(Boolean).forEach(({ label, value, strong, spaceBefore }) => {
      if (spaceBefore) this.space(4);
      this.ensure(20);
      const size = strong ? 11 : labelSize;
      this.y -= size + 4;
      this.text(label, { x, size, weight: strong ? 'bold' : 'regular', color: strong ? COLORS.ink : COLORS.muted });
      this.text(value, { x, size, weight: strong ? 'bold' : 'regular', color: COLORS.ink, align: 'right', width });
    });
  }

  async save() { return this.pdf.save(); }
}

const rgbOf = ([r, g, b]) => ({ type: 'RGB', red: r, green: g, blue: b });

/** Create a document builder with the standard fonts loaded. */
export async function createDoc({ title, subject } = {}) {
  const { PDFDocument, StandardFonts } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  if (title) pdf.setTitle(sanitise(title).text);
  if (subject) pdf.setSubject(sanitise(subject).text);
  pdf.setProducer('Tools by Decyfy');
  pdf.setCreator('Tools by Decyfy');
  const fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
  };
  return new DocBuilder(pdf, fonts);
}

/** Document title block: big title on the left, reference lines on the right. */
export function drawDocumentHeader(doc, { title, meta = [], issuer, issuerLines = [] }) {
  const top = doc.y;
  doc.text(title.toUpperCase(), { y: top, size: 22, weight: 'bold', color: COLORS.ink });

  let metaY = top + 4;
  meta.filter(Boolean).forEach(({ label, value }) => {
    doc.text(label, { x: A4.width - MARGIN - 220, y: metaY, size: 8.5, color: COLORS.muted, align: 'right', width: 110 });
    doc.text(value, { x: A4.width - MARGIN - 110, y: metaY, size: 9.5, weight: 'bold', color: COLORS.ink, align: 'right', width: 110 });
    metaY -= 14;
  });

  doc.y = Math.min(top - 30, metaY - 6);

  if (issuer) {
    doc.text(issuer, { size: 12, weight: 'bold' });
    doc.y -= 15;
    if (issuerLines.filter(Boolean).length) {
      doc.paragraph(issuerLines.filter(Boolean).join('\n'), { size: 9, width: 300 });
    }
  }
  doc.space(6);
  doc.rule();
  doc.space(16);
}

/** Two side-by-side labelled panels, e.g. seller and buyer. */
export function drawPartyPanels(doc, panels) {
  const gap = 16;
  const width = (doc.contentWidth - gap * (panels.length - 1)) / panels.length;

  const blocks = panels.map(p => {
    const lines = [];
    if (p.name) lines.push({ text: p.name, weight: 'bold', size: 10.5 });
    (p.lines || []).filter(Boolean).forEach(l => lines.push({ text: l, weight: 'regular', size: 9 }));
    return { title: p.title, lines };
  });

  const wrappedHeights = blocks.map(b =>
    b.lines.reduce((h, l) => h + doc.wrap(l.text, width - 20, l.size, l.weight).length * (l.size * 1.35), 0));
  const boxHeight = Math.max(...wrappedHeights, 20) + 34;

  doc.ensure(boxHeight + 10);
  const top = doc.y;

  blocks.forEach((b, i) => {
    const x = MARGIN + i * (width + gap);
    doc.box({ x, y: top - boxHeight, width, height: boxHeight, color: COLORS.panel });
    doc.text(b.title.toUpperCase(), { x: x + 10, y: top - 15, size: 7.5, weight: 'bold', color: COLORS.faint });
    let cursor = top - 30;
    b.lines.forEach(l => {
      doc.wrap(l.text, width - 20, l.size, l.weight).forEach(line => {
        doc.text(line, { x: x + 10, y: cursor, size: l.size, weight: l.weight, color: l.weight === 'bold' ? COLORS.ink : COLORS.muted });
        cursor -= l.size * 1.35;
      });
    });
  });

  doc.y = top - boxHeight - 18;
}

/** Signature line plus the disclaimer every generated document carries. */
export function drawFooter(doc, { signatureLabel, disclaimer, revenueStamp = false }) {
  doc.ensure(90);
  doc.y = Math.max(doc.y, MARGIN + 90);

  // An outlined placeholder for a physical revenue stamp, affixed by hand after
  // printing. Drawn to the left of the signature so a stamp does not cover it.
  if (revenueStamp) {
    const w = 92, h = 58;
    const x = A4.width - MARGIN - 180 - w - 22;
    doc.page.drawRectangle({
      x, y: doc.y - 46, width: w, height: h,
      borderColor: rgbOf(COLORS.faint), borderWidth: 0.8, borderDashArray: [3, 2],
    });
    doc.text('Affix revenue', { x, y: doc.y - 12, size: 7.5, color: COLORS.faint, align: 'center', width: w });
    doc.text('stamp here', { x, y: doc.y - 22, size: 7.5, color: COLORS.faint, align: 'center', width: w });
  }

  if (signatureLabel) {
    const x = A4.width - MARGIN - 180;
    doc.rule({ y: doc.y - 34, x, width: 180, color: COLORS.faint });
    doc.text(signatureLabel, { x, y: doc.y - 46, size: 8.5, color: COLORS.muted, align: 'center', width: 180 });
  }

  if (disclaimer) {
    // Pinned to the bottom margin of the current page, never paginated.
    const lines = doc.wrap(disclaimer, doc.contentWidth, 7.5);
    const blockHeight = lines.length * 7.5 * 1.3;
    const baseline = MARGIN + blockHeight - 7.5;
    doc.rule({ y: baseline + 14, color: COLORS.rule });
    doc.paragraphAt(disclaimer, { y: baseline, size: 7.5, color: COLORS.faint });
  }
}

export { COLORS, MARGIN, A4 };

/**
 * Table detection for digitally generated PDFs.
 *
 * Lifted verbatim out of app/pdf-to-word/page.js so PDF to Excel can use the
 * same pipeline rather than growing a second, subtly different one. The logic
 * is unchanged — the thresholds below were calibrated against real government
 * report PDFs and are load-bearing; see the comments on each helper.
 *
 * Pure: no DOM, no pdf.js, no React. It takes the text items pdf.js already
 * produced and works out where the tables are, so it can be tested in Node.
 *
 * The pipeline:
 *   text items -> lines -> tokens (cells) -> table blocks -> rows of cells
 */

/* ── Helper: extract positioned text items ─────────────────── */
export function extractPositionedItems(textContent, viewportHeight) {
  return textContent.items
    .filter(item => item.str.trim().length > 0)
    .map(item => {
      const tx = item.transform;
      return {
        text: item.str,
        x: tx[4],
        y: viewportHeight - tx[5],            // flip y (pdf.js y is bottom-up)
        fontSize: Math.round(Math.abs(tx[0]) || Math.abs(tx[3]) || 12),
        fontName: item.fontName || '',
        width: item.width,
        height: Math.abs(tx[3]) || item.height || 12,
      };
    })
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

/* ── Helper: group items into lines by y-position ──────────── */
export function groupIntoLines(items) {
  if (!items.length) return [];
  const lines = [];
  let cur = [items[0]];
  for (let i = 1; i < items.length; i++) {
    const tol = Math.max(cur[0].height * 0.4, 3);
    if (Math.abs(items[i].y - cur[0].y) <= tol) {
      cur.push(items[i]);
    } else {
      cur.sort((a, b) => a.x - b.x);
      lines.push(cur);
      cur = [items[i]];
    }
  }
  cur.sort((a, b) => a.x - b.x);
  lines.push(cur);
  return lines;
}

/* ── Helper: join line items with smart spacing ────────────── */
export function lineToText(line) {
  let result = '';
  for (let i = 0; i < line.length; i++) {
    if (i > 0) {
      const gap = line[i].x - (line[i - 1].x + line[i - 1].width);
      if (gap > line[i].fontSize * 0.3) result += ' ';
    }
    result += line[i].text;
  }
  return result;
}

/* ── Helper: split a line into cells at genuine column gaps ──
   A real table column gutter is a large, deliberate gap — much
   bigger than the space between two words in a sentence. Splitting
   on every word (the old behaviour) turned ordinary paragraphs into
   giant fake tables. The threshold below was calibrated against
   real government-report PDFs: normal word/bullet gaps stay under
   ~17pt even at large font sizes, while real table gutters start
   around 20pt and go much higher. ─────────────────────────────── */
export function tokenizeLine(line) {
  const avgFS = line.reduce((s, it) => s + it.fontSize, 0) / line.length;
  const bigGap = Math.max(avgFS * 1.5, 20);
  const tokens = [];
  let cur = [line[0]];
  for (let i = 1; i < line.length; i++) {
    const gap = line[i].x - (line[i - 1].x + line[i - 1].width);
    if (gap > bigGap) {
      tokens.push(cur);
      cur = [line[i]];
    } else {
      cur.push(line[i]);
    }
  }
  tokens.push(cur);
  return tokens.map(tk => ({
    x: tk[0].x,
    xe: tk[tk.length - 1].x + tk[tk.length - 1].width,
    text: lineToText(tk),
  }));
}

export function modeOf(arr) {
  const freq = new Map();
  let best = arr[0], bestCount = 0;
  for (const v of arr) {
    const c = (freq.get(v) || 0) + 1;
    freq.set(v, c);
    if (c > bestCount) { bestCount = c; best = v; }
  }
  return best;
}

/* ── Helper: cluster token x-positions in a block into columns ─
   Computed once over the whole block (not grown row-by-row) so
   columns stay stable and aligned across rows of different length. */
export function buildTableBlock(startIdx, endIdx, lineTokens) {
  const allX = [];
  for (let i = startIdx; i <= endIdx; i++) {
    for (const tok of lineTokens[i]) allX.push(tok.x);
  }
  allX.sort((a, b) => a - b);

  const clusterTol = 25;
  const clusters = [];
  for (const x of allX) {
    const last = clusters[clusters.length - 1];
    if (last && x - last.max <= clusterTol) {
      last.sum += x; last.count++; last.max = x;
    } else {
      clusters.push({ sum: x, count: 1, max: x });
    }
  }
  return { startIdx, endIdx, columns: clusters.map(c => c.sum / c.count) };
}

/* ── Helper: split side-by-side twin tables via row sidedness ──
   Slide-style PDFs often place two unrelated tables next to each
   other. Because their rows don't share baselines, the merged block
   has rows that populate ONLY the left or ONLY the right columns.
   When a column boundary exists where single-sided rows dominate
   (and no token physically crosses it), it is two tables, not one. */
export function splitTwinTables(tb, lineTokens) {
  const { columns } = tb;
  if (columns.length < 4) return [tb];

  let best = null;
  for (let b = 2; b <= columns.length - 2; b++) {
    const splitX = (columns[b - 1] + columns[b]) / 2;
    let L = 0, R = 0, B = 0, crossed = false;
    for (let i = tb.startIdx; i <= tb.endIdx; i++) {
      let hasL = false, hasR = false;
      for (const tok of lineTokens[i]) {
        if (tok.x < splitX - 10 && tok.xe > splitX + 10) { crossed = true; break; }
        if (tok.x < splitX) hasL = true; else hasR = true;
      }
      if (crossed) break;
      if (hasL && hasR) B++;
      else if (hasL) L++;
      else if (hasR) R++;
    }
    if (crossed) continue;
    if (L >= 1 && R >= 1 && L + R >= B) {
      const score = L + R;
      if (!best || score > best.score) best = { idx: b, splitX, score };
    }
  }
  if (!best) return [tb];

  const left  = { startIdx: tb.startIdx, endIdx: tb.endIdx, columns: columns.slice(0, best.idx), side: [-Infinity, best.splitX] };
  const right = { startIdx: tb.startIdx, endIdx: tb.endIdx, columns: columns.slice(best.idx), side: [best.splitX, Infinity] };
  return [...splitTwinTables(left, lineTokens), ...splitTwinTables(right, lineTokens)];
}

/* ── Helper: build one row's cells with column spans ──────────
   A label whose physical extent covers several columns (spanning
   header) becomes one merged cell rather than a sparse blank row. */
export function rowToCells(tokens, columns) {
  const n = columns.length;
  const byCol = new Map();
  for (const tok of tokens) {
    let c = 0, bestD = Infinity;
    for (let k = 0; k < n; k++) {
      const d = Math.abs(tok.x - columns[k]);
      if (d < bestD) { bestD = d; c = k; }
    }
    if (byCol.has(c)) {
      const p = byCol.get(c);
      p.text += ' ' + tok.text;
      p.xe = Math.max(p.xe, tok.xe);
    } else {
      byCol.set(c, { text: tok.text, xe: tok.xe });
    }
  }
  const colIdxs = [...byCol.keys()].sort((a, b) => a - b);
  const cells = [];
  let cursor = 0;
  for (let k = 0; k < colIdxs.length; k++) {
    const c = colIdxs[k];
    if (c > cursor) cells.push({ text: '', span: c - cursor });
    const nextStart = k + 1 < colIdxs.length ? colIdxs[k + 1] : n;
    const tok = byCol.get(c);
    let endCol = c;
    while (endCol + 1 < nextStart && columns[endCol + 1] <= tok.xe) endCol++;
    cells.push({ text: tok.text, span: endCol - c + 1 });
    cursor = endCol + 1;
    if (k + 1 < colIdxs.length && cursor < nextStart) {
      cells.push({ text: '', span: nextStart - cursor });
      cursor = nextStart;
    }
  }
  if (cursor < n) cells.push({ text: '', span: n - cursor });
  return cells;
}

/* ── Helper: extract one (possibly split) table's rows ───────── */
export function tableRowsForSide(tb, lineTokens) {
  const side = tb.side || [-Infinity, Infinity];
  const rows = [];
  for (let i = tb.startIdx; i <= tb.endIdx; i++) {
    const toks = lineTokens[i].filter(t => t.x >= side[0] && t.x < side[1]);
    if (!toks.length) continue;
    rows.push(rowToCells(toks, tb.columns));
  }
  return rows;
}

/* ── Helper: detect table blocks from tokenized lines ───────── */
export function detectTableBlocks(lines, lineTokens) {
  const tables = [];
  let tStart = -1, counts = [];

  const flush = (endExclusive) => {
    if (tStart >= 0 && endExclusive - tStart >= 3) {
      tables.push(buildTableBlock(tStart, endExclusive - 1, lineTokens));
    }
    tStart = -1; counts = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const toks = lineTokens[i];
    // A row needs at least 2 genuine cells to be table-shaped at all.
    if (toks.length < 2) { flush(i); continue; }

    if (tStart < 0) {
      tStart = i; counts = [toks.length];
      continue;
    }

    const m = modeOf(counts);
    if (Math.abs(toks.length - m) <= 1) {
      counts.push(toks.length);
    } else {
      flush(i);
      tStart = i; counts = [toks.length];
    }
  }
  flush(lines.length);
  return tables;
}

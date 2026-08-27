'use client';
import { useState } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';

/* ── Helper: extract positioned text items ─────────────────── */
function extractPositionedItems(textContent, viewportHeight) {
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
function groupIntoLines(items) {
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
function lineToText(line) {
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
function tokenizeLine(line) {
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

function modeOf(arr) {
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
function buildTableBlock(startIdx, endIdx, lineTokens) {
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
function splitTwinTables(tb, lineTokens) {
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
function rowToCells(tokens, columns) {
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
function tableRowsForSide(tb, lineTokens) {
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
function detectTableBlocks(lines, lineTokens) {
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

/* ── Helper: extract images from a PDF page ────────────────── */
async function extractPageImages(page) {
  try {
    const ops = await page.getOperatorList();
    const OPS = window.pdfjsLib.OPS;
    const images = [];

    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === OPS.paintImageXObject ||
          ops.fnArray[i] === OPS.paintJpegXObject) {
        const imgName = ops.argsArray[i][0];
        try {
          const imgData = await new Promise((resolve, reject) => {
            const to = setTimeout(() => reject(new Error('timeout')), 3000);
            page.objs.get(imgName, data => { clearTimeout(to); resolve(data); });
          });

          if (imgData && imgData.width > 50 && imgData.height > 50) {
            const canvas = document.createElement('canvas');
            canvas.width = imgData.width;
            canvas.height = imgData.height;
            const ctx = canvas.getContext('2d');

            if (imgData.data) {
              const id = ctx.createImageData(imgData.width, imgData.height);
              if (imgData.kind === 1) {                   // GRAYSCALE
                for (let p = 0; p < imgData.data.length; p++) {
                  id.data[p * 4] = id.data[p * 4 + 1] = id.data[p * 4 + 2] = imgData.data[p];
                  id.data[p * 4 + 3] = 255;
                }
              } else if (imgData.kind === 2) {            // RGB
                let si = 0;
                for (let p = 0; p < imgData.width * imgData.height; p++) {
                  id.data[p * 4]     = imgData.data[si++];
                  id.data[p * 4 + 1] = imgData.data[si++];
                  id.data[p * 4 + 2] = imgData.data[si++];
                  id.data[p * 4 + 3] = 255;
                }
              } else if (imgData.kind === 3) {            // RGBA
                id.data.set(imgData.data);
              }
              ctx.putImageData(id, 0, 0);
            } else if (imgData.src) {
              ctx.drawImage(imgData, 0, 0);
            }

            const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
            if (blob && blob.size > 500) {
              const arrayBuffer = await blob.arrayBuffer();
              images.push({
                data: new Uint8Array(arrayBuffer),
                width: imgData.width,
                height: imgData.height,
              });
            }
          }
        } catch (_) { /* skip this image */ }
        // Yield between images — a single page can embed several
        // large screenshots, and the pixel-copy work above is
        // synchronous enough to stall the tab if run back-to-back.
        await new Promise((res) => setTimeout(res, 0));
      }
    }
    return images;
  } catch (_) { return []; }
}

/* ── Main Component ────────────────────────────────────────── */
const MAX_MB = 50;
const MAX_PAGES = 100;
const EXACT_RENDER_SCALE = 2; // page-image resolution for Exact Layout mode

export default function PDFToWord() {
  const [file, setFile]       = useState(null);
  const [mode, setMode]       = useState('editable'); // 'editable' | 'exact'
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError]     = useState('');

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Please upload a PDF file.'); return; }
    if (f.size > MAX_MB * 1048576) { setError(`File too large — max ${MAX_MB} MB. Try our Compress PDF tool first.`); return; }
    setError('');
    setFile(f);
  };

  const convert = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setProgress('Reading PDF...');

    try {
      /* 1. Load pdf.js */
      if (!window.pdfjsLib) {
        try {
          await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
          });
        } catch (_) {
          throw new Error('Could not load the PDF engine. Check your internet connection and try again.');
        }
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      const bytes = await file.arrayBuffer();
      let pdf;
      try {
        pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
      } catch (e) {
        if (e?.name === 'PasswordException') {
          throw new Error('This PDF is password-protected. Unlock it first with our PDF Unlock tool, then convert.');
        }
        if (e?.name === 'InvalidPDFException') {
          throw new Error('This file does not appear to be a valid PDF. It may be corrupt or incomplete.');
        }
        throw e;
      }
      const totalPages = pdf.numPages;

      if (totalPages > MAX_PAGES) {
        throw new Error(`This PDF has ${totalPages} pages — the limit is ${MAX_PAGES}. Split it into smaller parts with our Split PDF tool, then convert each part.`);
      }

      setProgress(`Analyzing ${totalPages} pages...`);

      /* 2. Import docx library */
      const dx = await import('docx');

      /* ── Exact Layout mode: one page-image per Word page ────── */
      if (mode === 'exact') {
        const sections = [];
        for (let pg = 1; pg <= totalPages; pg++) {
          setProgress(`Rendering page ${pg} of ${totalPages}...`);

          const page = await pdf.getPage(pg);
          const viewport = page.getViewport({ scale: EXACT_RENDER_SCALE });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          // JPEG has no alpha — pre-fill white so unpainted PDF areas
          // don't come out black.
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // intent: 'print' — display-intent rendering schedules its work via
          // requestAnimationFrame, which browsers suspend in hidden tabs, so a
          // user who switches tabs mid-conversion would hang forever. Print
          // intent uses timeouts and keeps rendering in the background.
          await page.render({ canvasContext: ctx, viewport, intent: 'print' }).promise;

          const blob = await new Promise((res, rej) =>
            canvas.toBlob(b => (b ? res(b) : rej(new Error(`Could not render page ${pg}.`))), 'image/jpeg', 0.85));
          const jpegBytes = new Uint8Array(await blob.arrayBuffer());

          // Page geometry in points (scale-1 viewport units)
          const ptW = viewport.width / EXACT_RENDER_SCALE;
          const ptH = viewport.height / EXACT_RENDER_SCALE;
          const landscape = ptW > ptH;
          // docx-js expects portrait dimensions + LANDSCAPE flag (it swaps
          // internally); sizes are DXA (1pt = 20 dxa).
          const sizeW = Math.round((landscape ? ptH : ptW) * 20);
          const sizeH = Math.round((landscape ? ptW : ptH) * 20);

          sections.push({
            properties: {
              page: {
                size: {
                  width: sizeW,
                  height: sizeH,
                  orientation: landscape ? dx.PageOrientation.LANDSCAPE : dx.PageOrientation.PORTRAIT,
                },
                margin: { top: 0, bottom: 0, left: 0, right: 0 },
              },
            },
            children: [new dx.Paragraph({
              spacing: { before: 0, after: 0 },
              children: [new dx.ImageRun({
                data: jpegBytes,
                // ImageRun sizes are px at 96dpi: px = pt * 96/72
                transformation: { width: Math.round(ptW * 4 / 3), height: Math.round(ptH * 4 / 3) },
                type: 'jpg',
                altText: { id: pg, name: `Page ${pg}`, description: `Page ${pg}`, title: `Page ${pg}` },
              })],
            })],
          });

          await new Promise((res) => setTimeout(res, 0));
        }

        setProgress('Creating Word document...');
        const exactDoc = new dx.Document({ sections });
        const exactBlob = await dx.Packer.toBlob(exactDoc);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(exactBlob);
        a.download = file.name.replace('.pdf', '.docx');
        a.click();
        setProgress('Done!');
        setLoading(false);
        setProgress('');
        return;
      }

      const allChildren = [];

      // Word tolerates duplicate drawing ids, but Google Docs rejects the
      // whole file ("image format is invalid or unsupported") unless every
      // image's docPr id is unique. docx-js only honors an explicit id
      // passed through altText, so number the images ourselves.
      let imageId = 0;
      const imageAltText = () => {
        imageId += 1;
        return { id: imageId, name: `Image ${imageId}`, description: `Image ${imageId}`, title: `Image ${imageId}` };
      };

      /* 3. Process each page */
      for (let pg = 1; pg <= totalPages; pg++) {
        setProgress(`Processing page ${pg} of ${totalPages}...`);

        const page     = await pdf.getPage(pg);
        const viewport = page.getViewport({ scale: 1 });
        const tc       = await page.getTextContent();

        // Page break between pages
        if (pg > 1) {
          allChildren.push(new dx.Paragraph({ pageBreakBefore: true, children: [] }));
        }

        // Extract positioned text items
        const items = extractPositionedItems(tc, viewport.height);

        if (items.length === 0) {
          // Image-only page — try to get images
          const imgs = await extractPageImages(page);
          for (const img of imgs) {
            const maxW = 570, scale = Math.min(1, maxW / img.width);
            try {
              allChildren.push(new dx.Paragraph({
                children: [new dx.ImageRun({
                  data: img.data,
                  transformation: { width: Math.round(img.width * scale), height: Math.round(img.height * scale) },
                  type: 'png',
                  altText: imageAltText(),
                })]
              }));
            } catch (_) {}
          }
          await new Promise((res) => setTimeout(res, 0));
          continue;
        }

        // Group into lines
        const lines = groupIntoLines(items);

        // Tokenize each line into cells (splitting only at genuine
        // column gaps) and detect table blocks from those tokens
        const lineTokens = lines.map(tokenizeLine);
        const tableBlocks = detectTableBlocks(lines, lineTokens);
        const tableLineSet = new Set();
        for (const tb of tableBlocks) {
          for (let k = tb.startIdx; k <= tb.endIdx; k++) tableLineSet.add(k);
        }

        // Median font size (= "normal" text size)
        const fSizes = items.map(it => it.fontSize).sort((a, b) => a - b);
        const medFS  = fSizes[Math.floor(fSizes.length / 2)] || 12;

        // Typical left margin X
        const leftXs = lines
          .filter((_, k) => !tableLineSet.has(k))
          .map(ln => ln[0].x);
        leftXs.sort((a, b) => a - b);
        const typLeftX = leftXs[Math.floor(leftXs.length * 0.1)] || 0;

        // Walk through lines
        let tbIdx = 0, li = 0;

        while (li < lines.length) {
          /* ── Table block ── */
          if (tbIdx < tableBlocks.length && li === tableBlocks[tbIdx].startIdx) {
            const tb = tableBlocks[tbIdx];

            // A block may actually hold two tables sitting side by side —
            // emit each split table separately, one after the other.
            for (const sub of splitTwinTables(tb, lineTokens)) {
              const nCols = sub.columns.length;
              const colW = Math.floor(9000 / nCols);
              const cellRows = tableRowsForSide(sub, lineTokens);
              if (!cellRows.length) continue;

              const rows = cellRows.map((cells, ri) =>
                new dx.TableRow({
                  children: cells.map(cell =>
                    new dx.TableCell({
                      children: [new dx.Paragraph({
                        children: [new dx.TextRun({
                          text: cell.text.trim() || ' ',
                          size: medFS * 2,
                          font: 'Calibri',
                          bold: ri === 0,
                        })]
                      })],
                      columnSpan: cell.span > 1 ? cell.span : undefined,
                      width: { size: colW * cell.span, type: dx.WidthType.DXA },
                    })
                  ),
                })
              );

              // columnWidths fills <w:tblGrid> — without it docx-js emits
              // 100-twip stub columns, which Word auto-fits over but Pages
              // and Google Docs obey literally (1.8mm-wide columns).
              allChildren.push(new dx.Table({
                rows,
                columnWidths: sub.columns.map(() => colW),
                layout: dx.TableLayoutType.FIXED,
                width: { size: 9000, type: dx.WidthType.DXA },
              }));
              allChildren.push(new dx.Paragraph({ children: [] })); // spacer
            }

            li = tb.endIdx + 1;
            tbIdx++;
            continue;
          }

          /* ── Regular text ── */
          const ln      = lines[li];
          const lnText  = lineToText(ln);
          const lnFS    = ln[0].fontSize;
          const lnBold  = ln[0].fontName.toLowerCase().includes('bold');
          const isH1    = lnFS > medFS * 1.3;
          const isH2    = lnFS > medFS * 1.1 && lnBold;

          // Alignment from geometry: a line with roughly equal left/right
          // margins (and clearly inset from the normal left edge) is
          // centered; one hugging the right edge is right-aligned.
          const lnLast   = ln[ln.length - 1];
          const lnLeft   = ln[0].x;
          const lnRight  = viewport.width - (lnLast.x + lnLast.width);
          const centered = Math.abs(lnLeft - lnRight) < 18 && lnLeft > typLeftX + 25;
          const rightAl  = !centered && lnRight < 25 && lnLeft > typLeftX + 60;

          // Indentation (relative to typical left margin)
          const indent     = Math.max(0, Math.round((ln[0].x - typLeftX) / 10) * 10);
          const indTwips   = Math.round(indent * 15);

          // Paragraph grouping — merge consecutive lines with same style & small
          // y-gap. Centered/right-aligned lines (letterheads, dates, addresses)
          // keep their own line each — merging them into one flowing paragraph
          // destroys the layout.
          let pText = lnText;
          let ni    = li + 1;

          if (!isH1 && !isH2 && !centered && !rightAl) {
            while (ni < lines.length && !tableLineSet.has(ni)) {
              const nl   = lines[ni];
              const yGap = nl[0].y - (lines[ni - 1][0].y + lines[ni - 1][0].height);
              const nlBold = nl[0].fontName.toLowerCase().includes('bold');
              if (yGap < medFS * 0.8 &&
                  Math.abs(nl[0].fontSize - lnFS) < 2 &&
                  nlBold === lnBold) {
                pText += ' ' + lineToText(nl);
                ni++;
              } else break;
            }
          } else {
            ni = li + 1;
          }

          if (pText.trim()) {
            allChildren.push(new dx.Paragraph({
              heading: isH1 ? dx.HeadingLevel.HEADING_1
                     : isH2 ? dx.HeadingLevel.HEADING_2
                     : undefined,
              alignment: centered ? dx.AlignmentType.CENTER
                       : rightAl ? dx.AlignmentType.RIGHT
                       : undefined,
              indent: !centered && !rightAl && indTwips > 0 ? { left: indTwips } : undefined,
              children: [new dx.TextRun({
                text: pText.trim(),
                size: lnFS * 2,
                font: 'Calibri',
                bold: lnBold || isH1 || isH2,
              })],
            }));
          }

          li = ni;
        }

        // Extract images for this page
        setProgress(`Extracting images from page ${pg}...`);
        const imgs = await extractPageImages(page);
        for (const img of imgs) {
          const maxW = 570, scale = Math.min(1, maxW / img.width);
          try {
            allChildren.push(new dx.Paragraph({
              children: [new dx.ImageRun({
                data: img.data,
                transformation: { width: Math.round(img.width * scale), height: Math.round(img.height * scale) },
                type: 'png',
                altText: imageAltText(),
              })]
            }));
          } catch (_) {}
        }

        // Yield to the browser between pages so a large/complex PDF
        // (many pages, dense tables, lots of images) doesn't peg the
        // main thread and trip the "page unresponsive" warning.
        await new Promise((res) => setTimeout(res, 0));
      }

      /* 4. Build and download Word document */
      setProgress('Creating Word document...');

      const doc = new dx.Document({
        sections: [{
          properties: {
            page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
          },
          children: allChildren,
        }],
      });

      const buffer = await dx.Packer.toBlob(doc);
      const a = document.createElement('a');
      a.href     = URL.createObjectURL(buffer);
      a.download = file.name.replace('.pdf', '.docx');
      a.click();
      setProgress('Done!');

    } catch (e) {
      setError(e.message || 'Conversion failed. Please try again with a different file.');
    }
    setLoading(false);
    setProgress('');
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">PDF to Word Converter</h1>
      <p className="text-slate-500 mb-2 text-sm">Convert PDF files to editable Word (.docx) documents with tables, images &amp; formatting. Free, browser-based.</p>
      <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
        ⚠️ Best for text-based PDFs. Scanned/image PDFs require OCR.
      </div>

      <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <span className="text-2xl">⏳</span>
        <div>
          <p className="text-sm font-bold text-amber-800">Large PDFs take time — please be patient</p>
          <p className="text-sm text-amber-700">
            Conversion runs entirely in your browser. Long, image-heavy documents can take
            <strong> several minutes</strong> (roughly 2–5 seconds per page). Keep this tab open —
            the progress message below the button shows it&apos;s working.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">⚠️ {error}</div>
      )}

      {!file ? (
        <div className="drop-zone mb-6"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('ptw-input').click()}>
          <div className="text-4xl mb-3">📄</div>
          <p className="font-semibold text-slate-700">Drop your PDF here or <span className="text-brand-700 underline">browse</span></p>
          <p className="text-xs text-slate-400 mt-1">Max {MAX_MB} MB · {MAX_PAGES} pages</p>
          <input id="ptw-input" type="file" accept=".pdf" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <span className="text-3xl">📄</span>
          <div className="flex-1">
            <p className="font-semibold text-slate-700 text-sm">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={() => { setFile(null); setError(''); }} className="text-xs text-red-500 font-medium">Remove</button>
        </div>
      )}

      {/* Conversion mode */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-2">Conversion mode</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['editable', 'Editable text', 'Real text and tables you can edit. Layout is approximate — colors, alignment and complex tables may differ from the PDF.'],
            ['exact', 'Exact layout', 'Looks identical to the PDF — every page becomes a full-page image. Text is NOT editable or selectable.'],
          ].map(([v, label, desc]) => (
            <button key={v} onClick={() => setMode(v)} disabled={loading}
              className={`text-left p-4 rounded-xl border-2 transition-colors ${mode === v ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-300'}`}>
              <p className={`text-sm font-bold mb-1 ${mode === v ? 'text-brand-800' : 'text-slate-700'}`}>{label}</p>
              <p className="text-xs text-slate-500 leading-snug">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {loading && progress && (
        <div className="mb-4 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-sm text-brand-700 font-medium">
          ⏳ {progress}
        </div>
      )}

      <button onClick={convert} disabled={!file || loading}
        className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors text-base">
        {loading ? '⏳ Converting...' : '📝 Convert to Word & Download'}
      </button>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-800">
        <strong>How it works:</strong> <em>Editable text</em> mode extracts text, tables, and images from your PDF and rebuilds them as a structured, editable Word document — close to the original, but not identical. <em>Exact layout</em> mode places each PDF page into Word as a full-page image, so it looks exactly like the PDF but cannot be edited. Scanned/image-only PDFs require OCR for text extraction.
      </div>

      <CrossBrandCard pageSlug="pdf-to-word" />
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['Why doesn’t the Word file look identical to my PDF?', 'PDF and Word are fundamentally different formats — PDF fixes every letter to an exact position; Word text flows. Editable-text mode rebuilds the document structure, so fonts, colors, and complex table styling can differ. If you need the exact appearance, use Exact layout mode — it is pixel-identical, but not editable.'],
            ['Does it preserve tables?', 'Yes — in Editable text mode the converter detects table structures, including side-by-side tables and merged header cells, and recreates them as real Word tables. Very complex multi-row headers may still need manual touch-up.'],
            ['Does it extract images?', 'Yes — embedded images are extracted from the PDF and included in the Word document, maintaining approximate sizing. In Exact layout mode the entire page, graphics and all, is preserved as-is.'],
            ['Can it convert scanned PDFs?', 'Editable-text mode cannot read scanned pages — use our OCR tool first to extract text. Exact layout mode works fine with scans, since it keeps pages as images.'],
            ['Is my PDF uploaded anywhere?', 'No — the conversion runs entirely in your browser. Your PDF never leaves your device.'],
          ].map(([q, a]) => (
            <details key={q} className="faq-item bg-white border border-slate-100 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 font-semibold text-slate-700 text-sm flex justify-between items-center">
                {q}<span className="text-brand-600 text-lg faq-icon"></span>
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-600">{a}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

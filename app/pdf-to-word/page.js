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

/* ── Helper: detect table blocks from lines ────────────────── */
function detectTableBlocks(lines) {
  const tables = [];
  let tStart = -1, tCols = null;

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln.length < 2) {
      if (tStart >= 0 && i - tStart >= 3) {
        tables.push({ startIdx: tStart, endIdx: i - 1, columns: tCols });
      }
      tStart = -1; tCols = null;
      continue;
    }

    const xPositions = ln.map(it => Math.round(it.x / 5) * 5);

    if (tStart < 0) {
      tStart = i; tCols = [...xPositions];
    } else {
      const overlap = xPositions.filter(x =>
        tCols.some(cx => Math.abs(x - cx) < 20)
      ).length;

      if (overlap >= Math.min(2, tCols.length * 0.5)) {
        for (const x of xPositions) {
          if (!tCols.some(cx => Math.abs(x - cx) < 20)) tCols.push(x);
        }
        tCols.sort((a, b) => a - b);
      } else {
        if (i - tStart >= 3) {
          tables.push({ startIdx: tStart, endIdx: i - 1, columns: tCols });
        }
        tStart = i; tCols = [...xPositions];
      }
    }
  }
  if (tStart >= 0 && lines.length - tStart >= 3) {
    tables.push({ startIdx: tStart, endIdx: lines.length - 1, columns: tCols });
  }
  return tables;
}

/* ── Helper: assign line items to table columns ────────────── */
function assignToColumns(line, columns) {
  const cells = columns.map(() => '');
  for (const item of line) {
    let bestCol = 0, bestDist = Infinity;
    for (let c = 0; c < columns.length; c++) {
      const dist = Math.abs(item.x - columns[c]);
      if (dist < bestDist) { bestDist = dist; bestCol = c; }
    }
    cells[bestCol] += (cells[bestCol] ? ' ' : '') + item.text;
  }
  return cells;
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
      }
    }
    return images;
  } catch (_) { return []; }
}

/* ── Main Component ────────────────────────────────────────── */
export default function PDFToWord() {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleFile = (f) => { if (f?.type === 'application/pdf') setFile(f); };

  const convert = async () => {
    if (!file) return;
    setLoading(true);
    setProgress('Reading PDF...');

    try {
      /* 1. Load pdf.js */
      if (!window.pdfjsLib) {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      const bytes = await file.arrayBuffer();
      const pdf   = await window.pdfjsLib.getDocument({ data: bytes }).promise;
      const totalPages = pdf.numPages;

      setProgress(`Analyzing ${totalPages} pages...`);

      /* 2. Import docx library */
      const dx = await import('docx');

      const allChildren = [];

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
                })]
              }));
            } catch (_) {}
          }
          continue;
        }

        // Group into lines
        const lines = groupIntoLines(items);

        // Detect table blocks
        const tableBlocks = detectTableBlocks(lines);
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
            const cols = tb.columns;
            const rows = [];

            for (let ri = tb.startIdx; ri <= tb.endIdx; ri++) {
              const cells = assignToColumns(lines[ri], cols);
              const isHeader = ri === tb.startIdx;
              rows.push(new dx.TableRow({
                children: cells.map(cellText =>
                  new dx.TableCell({
                    children: [new dx.Paragraph({
                      children: [new dx.TextRun({
                        text: cellText.trim() || ' ',
                        size: medFS * 2,
                        font: 'Calibri',
                        bold: isHeader,
                      })]
                    })],
                    width: { size: Math.floor(9000 / cols.length), type: dx.WidthType.DXA },
                  })
                ),
              }));
            }

            allChildren.push(new dx.Table({
              rows,
              width: { size: 9000, type: dx.WidthType.DXA },
            }));
            allChildren.push(new dx.Paragraph({ children: [] })); // spacer

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

          // Indentation (relative to typical left margin)
          const indent     = Math.max(0, Math.round((ln[0].x - typLeftX) / 10) * 10);
          const indTwips   = Math.round(indent * 15);

          // Paragraph grouping — merge consecutive lines with same style & small y-gap
          let pText = lnText;
          let ni    = li + 1;

          if (!isH1 && !isH2) {
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
              indent: indTwips > 0 ? { left: indTwips } : undefined,
              children: [new dx.TextRun({
                text: pText.trim(),
                size: (isH1 || isH2 ? lnFS : medFS) * 2,
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
              })]
            }));
          } catch (_) {}
        }
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
      alert('Conversion failed: ' + e.message);
    }
    setLoading(false);
    setProgress('');
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">PDF to Word Converter</h1>
      <p className="text-slate-500 mb-2 text-sm">Convert PDF files to editable Word (.docx) documents with tables, images &amp; formatting. Free, browser-based.</p>
      <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
        ⚠️ Best for text-based PDFs. Scanned/image PDFs require OCR.
      </div>

      {!file ? (
        <div className="drop-zone mb-6"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('ptw-input').click()}>
          <div className="text-4xl mb-3">📄</div>
          <p className="font-semibold text-slate-700">Drop your PDF here or <span className="text-brand-700 underline">browse</span></p>
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
          <button onClick={() => setFile(null)} className="text-xs text-red-500 font-medium">Remove</button>
        </div>
      )}

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
        <strong>How it works:</strong> This tool extracts text, tables, and images from your PDF and creates a structured Word document. Layout, headings, and paragraph formatting are preserved. Scanned/image-only PDFs require OCR for text extraction.
      </div>

      <CrossBrandCard pageSlug="pdf-to-word" />
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['Does it preserve tables?', 'Yes — the converter detects table structures in your PDF and recreates them with proper borders and cell content in the Word document.'],
            ['Does it extract images?', 'Yes — embedded images are extracted from the PDF and included in the Word document, maintaining approximate sizing.'],
            ['Can it convert scanned PDFs?', 'No — scanned PDFs are images, not text. Use our OCR tool first to extract text, then convert.'],
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

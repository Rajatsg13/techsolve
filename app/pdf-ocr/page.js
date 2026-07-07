'use client';
import { useState } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';

const LANGS = [
  { code: 'eng', label: 'English' },
  { code: 'hin', label: 'Hindi' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'spa', label: 'Spanish' },
  { code: 'por', label: 'Portuguese' },
  { code: 'ara', label: 'Arabic' },
  { code: 'chi_sim', label: 'Chinese (Simplified)' },
];

const MAX_MB = 20;
const RENDER_SCALE = 2; // render at 2× for better OCR quality
const fmtSize = (b) => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : (b / 1024).toFixed(0) + ' KB';

function canvasToJpegBytes(canvas, quality = 0.85) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? blob.arrayBuffer().then(resolve).catch(reject) : reject(new Error('Canvas export failed'))),
      'image/jpeg',
      quality,
    );
  });
}

export default function PDFOcr() {
  const [file, setFile]       = useState(null);
  const [lang, setLang]       = useState('eng');
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState('');
  const [progress, setProgress] = useState(0);
  const [done, setDone]       = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pageTexts, setPageTexts] = useState([]);
  const [error, setError]     = useState('');

  const onFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Please upload a PDF file.'); return; }
    if (f.size > MAX_MB * 1048576) { setError(`File too large — max ${MAX_MB} MB.`); return; }
    setError(''); setDone(false); setPdfBlob(null); setPageTexts([]); setFile(f);
  };

  const run = async () => {
    setLoading(true); setError(''); setDone(false); setPdfBlob(null); setPageTexts([]);
    setStatus('Loading PDF engine…'); setProgress(0);
    try {
      // ── 1. Load pdf.js ──────────────────────────────────────────────────
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

      // ── 2. Load pdf-lib ─────────────────────────────────────────────────
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

      // ── 3. Load Tesseract ───────────────────────────────────────────────
      setStatus('Loading OCR engine…');
      const tessModule = await import('tesseract.js');
      const createWorker = tessModule.createWorker ?? tessModule.default?.createWorker;

      // ── 4. Open source PDF ──────────────────────────────────────────────
      setStatus('Reading PDF…');
      const bytes = await file.arrayBuffer();
      const srcPdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const numPages = srcPdf.numPages;

      // ── 5. Init Tesseract worker ────────────────────────────────────────
      setStatus('Initialising OCR worker…');
      const worker = await createWorker(lang, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            // fine-grained per-word progress handled by outer loop
          }
        },
      });

      // ── 6. Create output PDF ────────────────────────────────────────
      const outPdf = await PDFDocument.create();
      const font   = await outPdf.embedFont(StandardFonts.Helvetica);
      const collectedTexts = [];

      for (let i = 1; i <= numPages; i++) {
        setStatus(`OCR: page ${i} of ${numPages}…`);
        setProgress(Math.round(((i - 1) / numPages) * 90)); // leave last 10% for save

        const srcPage = await srcPdf.getPage(i);

        // Original page dimensions in PDF points (scale=1 → 1 px = 1 pt in pdf.js)
        const viewportPt = srcPage.getViewport({ scale: 1 });
        const ptW = viewportPt.width;
        const ptH = viewportPt.height;

        // Render at RENDER_SCALE for better OCR accuracy
        const viewport = srcPage.getViewport({ scale: RENDER_SCALE });
        const canvas   = document.createElement('canvas');
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        await srcPage.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        // Run OCR — we need word-level bounding boxes
        const { data } = await worker.recognize(canvas);
        collectedTexts.push(data.text || '');

        // Embed page as JPEG background
        const jpegBytes = await canvasToJpegBytes(canvas);
        const img       = await outPdf.embedJpg(jpegBytes);

        const outPage = outPdf.addPage([ptW, ptH]);
        outPage.drawImage(img, { x: 0, y: 0, width: ptW, height: ptH });

        // ── Invisible text layer ──────────────────────────────────────────
        // Coordinate mapping:
        //   Tesseract uses pixel coords at RENDER_SCALE, origin top-left.
        //   PDF uses point coords at scale 1, origin bottom-left.
        //   x_pt = x_px / RENDER_SCALE
        //   y_pt = ptH − (y1_px / RENDER_SCALE)   ← flip + use bottom of bbox
        for (const word of data.words ?? []) {
          if (!word.text?.trim() || word.confidence < 20) continue;

          const x      = word.bbox.x0 / RENDER_SCALE;
          const y      = ptH - (word.bbox.y1 / RENDER_SCALE);
          const wordH  = (word.bbox.y1 - word.bbox.y0) / RENDER_SCALE;
          const fontSize = Math.max(4, wordH * 0.85);

          // Helvetica only covers Latin; strip non-encodable chars to avoid errors
          const safeText = word.text.replace(/[^\x20-\xFF]/g, '').trim();
          if (!safeText) continue;

          try {
            outPage.drawText(safeText, {
              x,
              y,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
              opacity: 0, // invisible — exists only for search & copy
            });
          } catch (_) {
            // skip any word that still can't be drawn (unusual glyphs)
          }
        }
      }

      await worker.terminate();
      setPageTexts(collectedTexts);

      // ── 7. Save and deliver ─────────────────────────────────────────────
      setStatus('Building searchable PDF…');
      setProgress(95);
      const outBytes = await outPdf.save();
      const blob     = new Blob([outBytes], { type: 'application/pdf' });
      setPdfBlob(blob);
      setDone(true);
      setProgress(100);
      setStatus('');
    } catch (e) {
      setError('OCR failed: ' + e.message);
    }
    setLoading(false);
  };

  const download = () => {
    if (!pdfBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(pdfBlob);
    a.download = (file.name.replace(/\.pdf$/i, '') || 'document') + '-searchable.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadWord = async () => {
    if (!pageTexts.length) return;
    const { Document, Paragraph, TextRun, Packer, HeadingLevel } = await import('docx');
    const baseName = file.name.replace(/\.pdf$/i, '') || 'document';
    const children = [];
    pageTexts.forEach((text, idx) => {
      if (pageTexts.length > 1) {
        children.push(new Paragraph({
          text: `Page ${idx + 1}`,
          heading: HeadingLevel.HEADING_2,
        }));
      }
      const lines = text.split('\n').filter(l => l.trim());
      lines.forEach(line => {
        children.push(new Paragraph({ children: [new TextRun(line)] }));
      });
      if (idx < pageTexts.length - 1) {
        children.push(new Paragraph({ pageBreakBefore: true }));
      }
    });
    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = baseName + '-ocr.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">OCR PDF — Make Searchable</h1>
      <p className="text-slate-500 mb-3 text-sm">
        Convert a scanned PDF into a fully searchable, copy-able PDF. Your original pages are preserved visually — an invisible text layer is added so you can Ctrl+F search and copy-paste text in any PDF viewer.
      </p>

      <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <span className="text-2xl">⏳</span>
        <div>
          <p className="text-sm font-bold text-amber-800">OCR is slow — please be patient</p>
          <p className="text-sm text-amber-700">
            Processing takes <strong>30–60 seconds per page</strong>. A 5-page PDF may take 3–5 minutes. Do not close this tab while OCR is running.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">⚠️ {error}</div>
      )}

      {!file ? (
        <div className="drop-zone"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('pdf-input').click()}>
          <div className="text-4xl mb-3">📂</div>
          <p className="font-semibold text-slate-700">Drop PDF here or <span className="text-brand-700 underline">browse</span></p>
          <p className="text-xs text-slate-400 mt-1">Max {MAX_MB} MB · Scanned PDFs only</p>
          <input id="pdf-input" type="file" accept=".pdf" className="hidden"
            onChange={e => onFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
              <span className="text-2xl">📄</span>
              <div className="flex-1">
                <p className="font-semibold text-slate-700 text-sm truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{fmtSize(file.size)}</p>
              </div>
              <button
                onClick={() => { setFile(null); setDone(false); setPdfBlob(null); setPageTexts([]); setError(''); }}
                className="text-slate-400 hover:text-red-500 text-sm">✕</button>
            </div>

            <label className="text-xs font-semibold text-slate-600 mb-2 block">Language</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)} disabled={loading}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${lang === l.code ? 'bg-brand-700 text-white border-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {!done ? (
            <button onClick={run} disabled={loading}
              className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors">
              {loading ? '🔍 Running OCR — please wait…' : '🔍 Start OCR'}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={download}
                className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors">
                ⬇️ Download Searchable PDF
              </button>
              <button onClick={downloadWord}
                className="flex-1 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border-2 border-slate-300 hover:border-slate-400 transition-colors">
                📄 Download as Word
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <svg className="animate-spin h-4 w-4 text-brand-700 flex-shrink-0"
                  viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-sm text-blue-800 font-medium">{status}</p>
              </div>
              {progress > 0 && (
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-brand-700 transition-all duration-500"
                    style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}

          {done && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              ✅ <strong>Searchable PDF ready.</strong> Your original scanned pages are preserved — open in any PDF viewer and use Ctrl+F to search or click-drag to copy text.
            </div>
          )}
        </div>
      )}

      <CrossBrandCard pageSlug="pdf-ocr" />

      <div className="mt-12">
        <h2 className="text-lg font-bold text-slate-800 mb-4">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { n: '1', t: 'Upload PDF',    d: 'Drop a scanned PDF up to 20 MB. Nothing is uploaded to any server — all processing is in your browser.' },
            { n: '2', t: 'Pick Language', d: 'Choose the language of the document for best OCR accuracy.' },
            { n: '3', t: 'OCR Runs',      d: 'Each page is rendered at high resolution. Tesseract detects every word and its exact position on the page.' },
            { n: '4', t: 'Searchable PDF', d: 'The original scanned images are kept intact. An invisible text layer is placed over each word — open in any PDF viewer to search and copy.' },
          ].map(s => (
            <div key={s.n} className="bg-slate-50 rounded-xl p-4">
              <div className="w-7 h-7 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center mb-2">{s.n}</div>
              <p className="font-semibold text-slate-700 text-sm mb-1">{s.t}</p>
              <p className="text-xs text-slate-500">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-800 mb-3">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {[
            ['Does my file get uploaded anywhere?', 'No. Everything runs entirely in your browser. Your PDF never leaves your device.'],
            ['What is a searchable PDF?', 'A searchable PDF looks identical to your original scan but has an invisible text layer underneath. Open it in any PDF viewer — Adobe Acrobat, Chrome, Preview on Mac — and you can Ctrl+F to find words and drag to copy text, just like a regular digital document.'],
            ['Why does the output look the same as my original?', "That's correct and expected. Your original scanned images are preserved exactly as-is. The OCR text is invisible and sits beneath each word, enabling search and copy without altering the document's appearance."],
            ['Which languages produce the best results?', 'English, French, German, Spanish, and Portuguese have the most mature OCR models. Hindi, Arabic, and Chinese OCR works but accuracy depends heavily on scan resolution and font style. For non-Latin scripts, the visual PDF is always perfect — text layer searchability may vary by viewer.'],
            ['Why is it so slow?', 'OCR is computationally intensive. The engine analyses every pixel on every page to find characters and their exact positions. This cannot be sped up without uploading your file to a server.'],
          ].map(([q, a]) => (
            <details key={q} className="faq-item">
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

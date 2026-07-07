'use client';
import { useState } from 'react';

const MAX_MB = 50;
const fmtSize = (b) => b >= 1048576 ? (b/1048576).toFixed(1)+' MB' : (b/1024).toFixed(0)+' KB';

function parseRanges(str, total) {
  const parts = str.split(',').map(s => s.trim()).filter(Boolean);
  const ranges = [];
  for (const p of parts) {
    if (p.includes('-')) {
      const [a, b] = p.split('-').map(Number);
      if (isNaN(a) || isNaN(b) || a < 1 || b > total || a > b) return null;
      ranges.push([a - 1, b - 1]);
    } else {
      const n = Number(p);
      if (isNaN(n) || n < 1 || n > total) return null;
      ranges.push([n - 1, n - 1]);
    }
  }
  return ranges.length ? ranges : null;
}

export default function PDFSplit() {
  const [file, setFile]       = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode]       = useState('all'); // 'all' | 'range'
  const [rangeStr, setRangeStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(false);

  const onFile = async (f) => {
    if (!f || f.type !== 'application/pdf') return;
    if (f.size > MAX_MB * 1048576) { setError(`File too large — max ${MAX_MB} MB.`); return; }
    setError(''); setDone(false);
    const { PDFDocument } = await import('pdf-lib');
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageCount(doc.getPageCount());
    setFile(f);
  };

  const split = async () => {
    if (!file) return;
    setLoading(true); setError(''); setDone(false);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });

      let ranges;
      if (mode === 'all') {
        ranges = Array.from({ length: pageCount }, (_, i) => [i, i]);
      } else {
        ranges = parseRanges(rangeStr, pageCount);
        if (!ranges) { setError('Invalid range. Use format like: 1-3, 5, 7-9'); setLoading(false); return; }
      }

      for (let i = 0; i < ranges.length; i++) {
        const [from, to] = ranges[i];
        const out = await PDFDocument.create();
        const indices = Array.from({ length: to - from + 1 }, (_, k) => from + k);
        const pages = await out.copyPages(src, indices);
        pages.forEach(p => out.addPage(p));
        const blob = new Blob([await out.save({ useObjectStreams: true })], { type: 'application/pdf' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = mode === 'all'
          ? `page-${from + 1}.pdf`
          : `part-${i + 1}-pages-${from + 1}${from !== to ? `-${to + 1}` : ''}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await new Promise(r => setTimeout(r, 300));
      }
      setDone(true);
    } catch (e) {
      setError('Split failed: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Split PDF</h1>
      <p className="text-slate-500 mb-8 text-sm">Split a PDF into individual pages or custom ranges. Runs entirely in your browser.</p>


      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">⚠️ {error}</div>
      )}

      {!file ? (
        <div className="drop-zone mb-6"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('pdf-input').click()}>
          <div className="text-4xl mb-3">📂</div>
          <p className="font-semibold text-slate-700">Drop PDF here or <span className="text-brand-700 underline">browse</span></p>
          <p className="text-xs text-slate-400 mt-1">Max {MAX_MB} MB</p>
          <input id="pdf-input" type="file" accept=".pdf" className="hidden" onChange={e => onFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl">📄</span>
            <div>
              <p className="font-semibold text-slate-700">{file.name}</p>
              <p className="text-xs text-slate-400">{fmtSize(file.size)} · {pageCount} pages</p>
            </div>
            <button onClick={() => { setFile(null); setDone(false); setError(''); }}
              className="ml-auto text-sm text-slate-400 hover:text-red-500">✕ Remove</button>
          </div>

          {/* Mode */}
          <div className="flex gap-3 mb-4">
            {[['all','Split every page'], ['range','Custom ranges']].map(([v, l]) => (
              <button key={v} onClick={() => setMode(v)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${mode===v ? 'bg-brand-700 text-white border-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}>
                {l}
              </button>
            ))}
          </div>

          {mode === 'range' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Page ranges</label>
              <input type="text" placeholder="e.g. 1-3, 5, 7-9" value={rangeStr}
                onChange={e => setRangeStr(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <p className="text-xs text-slate-400 mt-1">Each range downloads as a separate PDF file.</p>
            </div>
          )}
        </div>
      )}

      {file && (
        <button onClick={split} disabled={loading}
          className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors">
          {loading ? '⏳ Splitting…' : `✂️ Split PDF${mode==='all' ? ` into ${pageCount} files` : ''}`}
        </button>
      )}

      {done && (
        <div className="mt-4 space-y-2">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 text-center">
            ✅ Done! All files have been downloaded.
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 text-center">
            💡 Split files may be larger than the original — each file carries a full copy of the PDF&apos;s embedded fonts and images.{' '}
            <a href="/pdf-compress/" className="text-brand-600 font-medium hover:underline">Compress them here →</a>
          </div>
        </div>
      )}

    </div>
  );
}

'use client';
import { useState, useCallback } from 'react';

export default function PDFMerge() {
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const addFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => f.type === 'application/pdf');
    setFiles(prev => [...prev, ...pdfs.map(f => ({ file: f, name: f.name, size: (f.size / 1024).toFixed(1) + ' KB' }))]);
  };

  const moveUp   = (i) => setFiles(f => { const a = [...f]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; });
  const moveDown = (i) => setFiles(f => { const a = [...f]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; });
  const remove   = (i) => setFiles(f => f.filter((_, idx) => idx !== i));

  const merge = async () => {
    if (files.length < 2) { alert('Please add at least 2 PDF files.'); return; }
    setLoading(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const merged = await PDFDocument.create();
      for (const { file } of files) {
        const bytes = await file.arrayBuffer();
        const src = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const out = await merged.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'merged.pdf'; a.click();
    } catch (e) { alert('Merge failed: ' + e.message); }
    setLoading(false);
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Merge PDF Files</h1>
      <p className="text-slate-500 mb-8 text-sm">Combine multiple PDF files into one document. Reorder pages before merging. Free &amp; private — runs in your browser.</p>

      <div className="ad-slot h-20 mb-8">[ AdSense — Leaderboard ]</div>

      <div className={`drop-zone mb-6 ${dragging ? 'active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => document.getElementById('pdf-input').click()}>
        <div className="text-4xl mb-3">📂</div>
        <p className="font-semibold text-slate-700">Drop PDF files here or <span className="text-brand-700 underline">browse</span></p>
        <p className="text-xs text-slate-400 mt-1">Add 2 or more PDF files — drag to reorder</p>
        <input id="pdf-input" type="file" accept=".pdf" multiple className="hidden"
          onChange={e => addFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div className="mb-6 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
              <span className="text-2xl">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{f.name}</p>
                <p className="text-xs text-slate-400">{f.size}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => moveUp(i)} disabled={i === 0}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 text-sm flex items-center justify-center">↑</button>
                <button onClick={() => moveDown(i)} disabled={i === files.length - 1}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 text-sm flex items-center justify-center">↓</button>
                <button onClick={() => remove(i)}
                  className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-sm flex items-center justify-center">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={merge} disabled={files.length < 2 || loading}
        className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors text-base">
        {loading ? '⏳ Merging...' : `🔗 Merge ${files.length} PDFs & Download`}
      </button>

      <div className="mt-10 bg-slate-50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">How to Merge PDFs</h2>
        <ol className="space-y-3">
          {['Upload 2 or more PDF files using the button above.', 'Reorder files using the ↑ ↓ arrows — the order here is the page order in the merged PDF.', 'Click Merge and your combined PDF downloads instantly.'].map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-600">
              <span className="w-6 h-6 flex-shrink-0 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i+1}</span>{s}
            </li>
          ))}
        </ol>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['How many PDFs can I merge?', 'There is no hard limit — you can merge as many PDFs as you like, subject to your browser memory.'],
            ['Is there a file size limit?', 'No server-side limit. Very large files (100MB+) may be slow depending on your device.'],
            ['Will the merged PDF lose quality?', 'No — pdf-lib preserves the original quality of all pages.'],
          ].map(([q, a]) => (
            <details key={q} className="faq-item bg-white border border-slate-100 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 font-semibold text-slate-700 text-sm flex justify-between items-center">
                {q}<span className="text-brand-600 text-lg">+</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-600">{a}</div>
            </details>
          ))}
        </div>
      </section>
      <div className="ad-slot h-24 mt-10">[ AdSense — Rectangle ]</div>
    </div>
  );
}

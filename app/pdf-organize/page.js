'use client';
import { useState } from 'react';

const fmtSize = (b) => b >= 1048576 ? (b/1048576).toFixed(1)+' MB' : (b/1024).toFixed(0)+' KB';

export default function PDFOrganize() {
  const [file, setFile]   = useState(null);
  const [pages, setPages] = useState([]); // array of page indices
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const n = doc.getPageCount();
      setTotal(n);
      setPages(Array.from({ length: n }, (_, i) => i));
      setFile(f);
    } catch (e) {
      setError('Could not load PDF: ' + e.message);
    }
  };

  const moveUp   = (i) => setPages(p => { const a=[...p]; [a[i-1],a[i]]=[a[i],a[i-1]]; return a; });
  const moveDown = (i) => setPages(p => { const a=[...p]; [a[i],a[i+1]]=[a[i+1],a[i]]; return a; });
  const remove   = (i) => setPages(p => p.filter((_,idx)=>idx!==i));

  const save = async () => {
    setLoading(true); setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, pages);
      copied.forEach(p => out.addPage(p));
      const blob = new Blob([await out.save()], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'organized.pdf';
      a.click();
    } catch (e) {
      setError('Failed: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Organize PDF Pages</h1>
      <p className="text-slate-500 mb-8 text-sm">Reorder or delete pages in your PDF. Everything runs in your browser.</p>


      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">⚠️ {error}</div>}

      {!file ? (
        <div className="drop-zone"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('pdf-input').click()}>
          <div className="text-4xl mb-3">📂</div>
          <p className="font-semibold text-slate-700">Drop PDF here or <span className="text-brand-700 underline">browse</span></p>
          <input id="pdf-input" type="file" accept=".pdf" className="hidden" onChange={e => onFile(e.target.files[0])} />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <p className="font-semibold text-slate-700 text-sm">{file.name}</p>
              <p className="text-xs text-slate-400">{fmtSize(file.size)} · {total} pages total · {pages.length} remaining</p>
            </div>
            <button onClick={() => { setFile(null); setPages([]); }} className="text-sm text-slate-400 hover:text-red-500">✕</button>
          </div>

          <div className="space-y-2 mb-6">
            {pages.map((origIdx, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
                <span className="text-2xl">📄</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Page {origIdx + 1}</p>
                  <p className="text-xs text-slate-400">Position {i + 1} of {pages.length}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => moveUp(i)} disabled={i===0}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 text-sm flex items-center justify-center">↑</button>
                  <button onClick={() => moveDown(i)} disabled={i===pages.length-1}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 text-sm flex items-center justify-center">↓</button>
                  <button onClick={() => remove(i)}
                    className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-sm flex items-center justify-center">×</button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={save} disabled={loading || pages.length === 0}
            className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors">
            {loading ? '⏳ Saving…' : '💾 Save Organized PDF'}
          </button>
        </>
      )}
    </div>
  );
}

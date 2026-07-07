'use client';
import { useState } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';

const POSITIONS = [
  { id: 'bottom-center', label: 'Bottom Center' },
  { id: 'bottom-left',   label: 'Bottom Left' },
  { id: 'bottom-right',  label: 'Bottom Right' },
  { id: 'top-center',    label: 'Top Center' },
  { id: 'top-left',      label: 'Top Left' },
  { id: 'top-right',     label: 'Top Right' },
];
const fmtSize = (b) => b >= 1048576 ? (b/1048576).toFixed(1)+' MB' : (b/1024).toFixed(0)+' KB';

export default function PDFPageNumbers() {
  const [file, setFile]       = useState(null);
  const [position, setPosition] = useState('bottom-center');
  const [startNum, setStartNum] = useState(1);
  const [prefix, setPrefix]   = useState('');
  const [fontSize, setFontSize] = useState(11);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const onFile = (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setError(''); setFile(f);
  };

  const apply = async () => {
    setLoading(true); setError('');
    try {
      const { PDFDocument, rgb } = await import('pdf-lib');
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = doc.getPages();
      const margin = 28;

      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const label = `${prefix}${startNum + i}`;
        const textW = label.length * fontSize * 0.5;
        let x, y;
        const pos = position;
        if (pos.includes('bottom')) y = margin;
        else y = height - margin - fontSize;
        if (pos.includes('center')) x = width / 2 - textW / 2;
        else if (pos.includes('left')) x = margin;
        else x = width - margin - textW;

        page.drawText(label, { x, y, size: fontSize, color: rgb(0.3, 0.3, 0.3) });
      });

      const blob = new Blob([await doc.save()], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'numbered.pdf';
      a.click();
    } catch (e) {
      setError('Failed: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Add Page Numbers to PDF</h1>
      <p className="text-slate-500 mb-8 text-sm">Automatically number every page of your PDF. Choose position, start number and prefix.</p>
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <span className="text-2xl">📄</span>
            <div className="flex-1"><p className="font-semibold text-slate-700 text-sm truncate">{file.name}</p><p className="text-xs text-slate-400">{fmtSize(file.size)}</p></div>
            <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 text-sm">✕</button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Position</label>
            <div className="grid grid-cols-3 gap-2">
              {POSITIONS.map(p => (
                <button key={p.id} onClick={() => setPosition(p.id)}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${position===p.id ? 'bg-brand-700 text-white border-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Start Number</label>
              <input type="number" min="0" value={startNum} onChange={e => setStartNum(+e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Prefix (optional)</label>
              <input type="text" placeholder="e.g. Page " value={prefix} onChange={e => setPrefix(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Font Size: {fontSize}pt</label>
            <input type="range" min="8" max="24" value={fontSize} onChange={e => setFontSize(+e.target.value)} />
          </div>

          <p className="text-xs text-slate-400">Preview: <strong>{prefix}{startNum}</strong>, {prefix}{startNum+1}, {prefix}{startNum+2}…</p>

          <button onClick={apply} disabled={loading}
            className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors">
            {loading ? '⏳ Adding page numbers…' : '🔢 Add Page Numbers & Download'}
          </button>
        </div>
      )}
      <CrossBrandCard pageSlug="pdf-page-numbers" />
    </div>
  );
}

'use client';
import { useState } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';

const POSITIONS = ['diagonal','center','top-left','top-right','bottom-left','bottom-right'];
const fmtSize = (b) => b >= 1048576 ? (b/1048576).toFixed(1)+' MB' : (b/1024).toFixed(0)+' KB';

export default function PDFWatermark() {
  const [file, setFile]     = useState(null);
  const [text, setText]     = useState('CONFIDENTIAL');
  const [color, setColor]   = useState('#ff0000');
  const [opacity, setOpacity] = useState(30);
  const [fontSize, setFontSize] = useState(48);
  const [position, setPosition] = useState('diagonal');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const onFile = (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setError(''); setFile(f);
  };

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    return {r,g,b};
  };

  const apply = async () => {
    if (!file || !text.trim()) return;
    setLoading(true); setError('');
    try {
      const { PDFDocument, rgb, degrees } = await import('pdf-lib');
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const {r,g,b} = hexToRgb(color);
      const pages = doc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        let x, y, rotate = 0;
        if (position === 'diagonal') { x = width/2; y = height/2; rotate = 45; }
        else if (position === 'center') { x = width/2; y = height/2; }
        else if (position === 'top-left') { x = 60; y = height - 60; }
        else if (position === 'top-right') { x = width - 60; y = height - 60; }
        else if (position === 'bottom-left') { x = 60; y = 60; }
        else { x = width - 60; y = 60; }

        page.drawText(text, {
          x, y,
          size: fontSize,
          color: rgb(r, g, b),
          opacity: opacity / 100,
          rotate: degrees(rotate),
        });
      }
      const blob = new Blob([await doc.save()], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'watermarked.pdf';
      a.click();
    } catch (e) {
      setError('Failed: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Watermark PDF</h1>
      <p className="text-slate-500 mb-8 text-sm">Add a custom text watermark to every page of your PDF. 100% browser-based.</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <span className="text-2xl">📄</span>
              <div className="flex-1"><p className="font-semibold text-slate-700 text-sm truncate">{file.name}</p><p className="text-xs text-slate-400">{fmtSize(file.size)}</p></div>
              <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 text-sm">✕</button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Watermark Text</label>
              <input type="text" value={text} onChange={e => setText(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Color</label>
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Font Size: {fontSize}px</label>
                <input type="range" min="12" max="120" value={fontSize} onChange={e => setFontSize(+e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Opacity: {opacity}%</label>
              <input type="range" min="5" max="100" value={opacity} onChange={e => setOpacity(+e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {POSITIONS.map(p => (
                  <button key={p} onClick={() => setPosition(p)}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${position===p ? 'bg-brand-700 text-white border-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}>
                    {p.replace('-',' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center bg-slate-50 rounded-2xl border border-slate-100 p-8 gap-6">
            <div className="relative w-32 h-44 bg-white rounded shadow-md flex items-center justify-center overflow-hidden border border-slate-200">
              <span className="absolute text-red-500 font-bold text-xs opacity-30 rotate-45 whitespace-nowrap">{text || 'WATERMARK'}</span>
            </div>
            <button onClick={apply} disabled={loading || !text.trim()}
              className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors">
              {loading ? '⏳ Adding watermark…' : '💧 Apply & Download'}
            </button>
          </div>
        </div>
      )}
      <CrossBrandCard pageSlug="pdf-watermark" />
    </div>
  );
}

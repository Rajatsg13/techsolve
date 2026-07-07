'use client';
import { useState } from 'react';

const DPI_OPTIONS = [
  { label: 'Screen (72 DPI)', scale: 1 },
  { label: 'Medium (150 DPI)', scale: 2 },
  { label: 'High (300 DPI)', scale: 4 },
];
const fmtSize = (b) => b >= 1048576 ? (b/1048576).toFixed(1)+' MB' : (b/1024).toFixed(0)+' KB';

export default function PDFToJPG() {
  const [file, setFile]       = useState(null);
  const [pages, setPages]     = useState([]);
  const [scale, setScale]     = useState(2);
  const [quality, setQuality] = useState(90);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError]     = useState('');

  const onFile = (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setError(''); setPages([]); setFile(f);
  };

  const convert = async () => {
    setLoading(true); setError(''); setPages([]);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const results = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`Converting page ${i} of ${pdf.numPages}…`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
        results.push({ dataUrl, page: i });
      }

      setPages(results);
      setProgress('');
    } catch (e) {
      setError('Conversion failed: ' + e.message);
    }
    setLoading(false);
  };

  const download = (p) => {
    const a = document.createElement('a');
    a.href = p.dataUrl;
    a.download = `page-${p.page}.jpg`;
    a.click();
  };

  const downloadAll = async () => {
    for (const p of pages) {
      download(p);
      await new Promise(r => setTimeout(r, 300));
    }
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">PDF to JPG</h1>
      <p className="text-slate-500 mb-8 text-sm">Convert each PDF page to a JPG image. Choose quality and resolution. 100% browser-based.</p>
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
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <span className="text-2xl">📄</span>
              <div className="flex-1"><p className="font-semibold text-slate-700 text-sm truncate">{file.name}</p><p className="text-xs text-slate-400">{fmtSize(file.size)}</p></div>
              <button onClick={() => { setFile(null); setPages([]); }} className="text-slate-400 hover:text-red-500 text-sm">✕</button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block">Resolution</label>
              <div className="flex flex-col gap-2">
                {DPI_OPTIONS.map(opt => (
                  <label key={opt.scale} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="scale" checked={scale===opt.scale} onChange={() => setScale(opt.scale)} className="accent-brand-700" />
                    <span className="text-sm text-slate-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600">JPEG Quality</label>
                <span className="text-xs font-bold text-brand-700">{quality}%</span>
              </div>
              <input type="range" min="50" max="100" step="5" value={quality} onChange={e => setQuality(+e.target.value)} />
            </div>
          </div>

          <button onClick={convert} disabled={loading}
            className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors">
            {loading ? `⏳ ${progress}` : '🖼️ Convert to JPG'}
          </button>

          {pages.length > 0 && (
            <>
              <button onClick={downloadAll}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors">
                ⬇️ Download All {pages.length} Images
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {pages.map(p => (
                  <div key={p.page} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <img src={p.dataUrl} alt={`Page ${p.page}`} className="w-full object-contain" />
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Page {p.page}</span>
                      <button onClick={() => download(p)} className="text-xs text-brand-700 font-semibold hover:underline">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

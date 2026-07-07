'use client';
import { useState, useRef } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';

const PAGE_SIZES = [
  { label: 'Fit to image', id: 'fit' },
  { label: 'A4 (210×297mm)', id: 'a4' },
  { label: 'Letter (8.5×11in)', id: 'letter' },
];

export default function ScanToPDF() {
  const [images, setImages] = useState([]);
  const [pageSize, setPageSize] = useState('fit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cameraRef = useRef();

  const addFiles = (files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/'));
    Promise.all(imgs.map(f => new Promise(res => {
      const reader = new FileReader();
      reader.onload = e => res({ dataUrl: e.target.result, name: f.name });
      reader.readAsDataURL(f);
    }))).then(results => setImages(prev => [...prev, ...results]));
  };

  const moveUp   = (i) => setImages(a => { const b=[...a]; [b[i-1],b[i]]=[b[i],b[i-1]]; return b; });
  const moveDown = (i) => setImages(a => { const b=[...a]; [b[i],b[i+1]]=[b[i+1],b[i]]; return b; });
  const remove   = (i) => setImages(a => a.filter((_,idx)=>idx!==i));

  const generate = async () => {
    if (!images.length) return;
    setLoading(true); setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.create();

      for (const img of images) {
        const isJpeg = img.dataUrl.includes('jpeg') || img.dataUrl.includes('jpg');
        const res = await fetch(img.dataUrl);
        const bytes = await res.arrayBuffer();
        const embedded = isJpeg ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
        const { width: iw, height: ih } = embedded;

        let pw, ph;
        if (pageSize === 'a4') { pw = 595; ph = 842; }
        else if (pageSize === 'letter') { pw = 612; ph = 792; }
        else { pw = iw; ph = ih; }

        const page = doc.addPage([pw, ph]);
        const scale = Math.min(pw / iw, ph / ih);
        const w = iw * scale, h = ih * scale;
        page.drawImage(embedded, { x: (pw-w)/2, y: (ph-h)/2, width: w, height: h });
      }

      const blob = new Blob([await doc.save()], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'scanned.pdf';
      a.click();
    } catch (e) {
      setError('Failed: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Scan to PDF</h1>
      <p className="text-slate-500 mb-8 text-sm">Take photos with your phone camera or upload images and convert them to a PDF. No app needed.</p>
      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">⚠️ {error}</div>}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button onClick={() => cameraRef.current.click()}
          className="flex-1 py-3 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition-colors">
          📷 Take Photo
        </button>
        <button onClick={() => document.getElementById('file-input').click()}
          className="flex-1 py-3 border-2 border-brand-700 text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors">
          🖼️ Upload Images
        </button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => addFiles(e.target.files)} />
      <input id="file-input" type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />

      {images.length > 0 && (
        <>
          <div className="space-y-2 mb-5">
            {images.map((img, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
                <img src={img.dataUrl} alt="" className="w-12 h-12 object-cover rounded-lg" />
                <p className="flex-1 text-sm font-medium text-slate-700 truncate">{img.name}</p>
                <div className="flex gap-1">
                  <button onClick={() => moveUp(i)} disabled={i===0} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 text-sm flex items-center justify-center">↑</button>
                  <button onClick={() => moveDown(i)} disabled={i===images.length-1} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 text-sm flex items-center justify-center">↓</button>
                  <button onClick={() => remove(i)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-sm flex items-center justify-center">×</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Page Size</label>
            <div className="flex flex-col gap-2">
              {PAGE_SIZES.map(ps => (
                <label key={ps.id} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="pageSize" checked={pageSize===ps.id} onChange={() => setPageSize(ps.id)} className="accent-brand-700" />
                  <span className="text-sm text-slate-700">{ps.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading}
            className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors">
            {loading ? '⏳ Generating PDF…' : `📄 Create PDF from ${images.length} image${images.length>1?'s':''}`}
          </button>
        </>
      )}
      <CrossBrandCard pageSlug="scan-to-pdf" />
    </div>
  );
}

'use client';
import { useState, useRef, useCallback } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';

const PRESETS = [
  { label: 'HD', w: 1280, h: 720 },
  { label: 'FHD', w: 1920, h: 1080 },
  { label: 'Square', w: 1080, h: 1080 },
  { label: 'Thumb', w: 150, h: 150 },
];

const fmtSize = (b) => b >= 1048576 ? (b/1048576).toFixed(1)+' MB' : (b/1024).toFixed(0)+' KB';


export default function ImageResizer() {
  const [src, setSrc]         = useState(null);
  const [origW, setOrigW]     = useState(0);
  const [origH, setOrigH]     = useState(0);
  const [origSize, setOrigSize] = useState(0);
  const [width, setWidth]     = useState('');
  const [height, setHeight]   = useState('');
  const [lock, setLock]       = useState(true);
  const [format, setFormat]   = useState('jpeg');
  const [quality, setQuality] = useState(85);
  const [outSize, setOutSize] = useState(null);
  const [outUrl, setOutUrl]   = useState(null);
  const imgRef = useRef(null);

  const onFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setOrigSize(file.size);
    setOutUrl(null); setOutSize(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOrigW(img.width); setOrigH(img.height);
        setWidth(String(img.width)); setHeight(String(img.height));
        setSrc(e.target.result);
      };
      img.src = e.target.result;
      imgRef.current = img;
    };
    reader.readAsDataURL(file);
  };

  const handleW = (v) => {
    setWidth(v);
    if (lock && origW) setHeight(String(Math.round(origH * v / origW)));
  };
  const handleH = (v) => {
    setHeight(v);
    if (lock && origH) setWidth(String(Math.round(origW * v / origH)));
  };

  const applyPreset = (p) => { setWidth(String(p.w)); setHeight(String(p.h)); setLock(false); };

  const resize = useCallback(() => {
    if (!imgRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width  = parseInt(width)  || origW;
    canvas.height = parseInt(height) || origH;
    canvas.getContext('2d').drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    canvas.toBlob((blob) => {
      setOutSize(blob.size);
      setOutUrl(URL.createObjectURL(blob));
    }, mime, quality / 100);
  }, [width, height, format, quality, origW, origH]);

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Image Resizer</h1>
      <p className="text-slate-500 mb-8 text-sm">Resize JPG, PNG or WebP images. Change format and quality. 100% browser-based.</p>


      {/* Drop zone */}
      {!src && (
        <div className="drop-zone mb-6"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('img-input').click()}>
          <div className="text-4xl mb-3">🖼️</div>
          <p className="font-semibold text-slate-700">Drop image here or <span className="text-brand-700 underline">browse</span></p>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP supported</p>
          <input id="img-input" type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files[0])} />
        </div>
      )}

      {src && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs text-slate-500 mb-3">Original: <strong>{origW}×{origH}px</strong> · {fmtSize(origSize)}</p>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => applyPreset(p)}
                    className="px-3 py-1 text-xs font-medium border border-slate-200 rounded-lg hover:border-brand-400 hover:text-brand-700 transition-colors">
                    {p.label} {p.w}×{p.h}
                  </button>
                ))}
              </div>

              {/* Width / Height */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Width (px)</label>
                  <input type="number" value={width} onChange={e => handleW(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
                <button onClick={() => setLock(!lock)} className="mt-5 text-xl" title="Lock aspect ratio">
                  {lock ? '🔒' : '🔓'}
                </button>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Height (px)</label>
                  <input type="number" value={height} onChange={e => handleH(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              </div>

              {/* Format */}
              <div className="mb-3">
                <label className="text-xs text-slate-500 mb-1 block">Output Format</label>
                <div className="flex gap-2">
                  {['jpeg','png','webp'].map(f => (
                    <button key={f} onClick={() => setFormat(f)}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${format===f ? 'bg-brand-700 text-white border-brand-700' : 'text-slate-600 border-slate-200 hover:border-brand-300'}`}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              {format !== 'png' && (
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-slate-500">Quality</label>
                    <span className="text-xs font-bold text-brand-700">{quality}%</span>
                  </div>
                  <input type="range" min="10" max="100" step="5" value={quality}
                    onChange={e => setQuality(+e.target.value)} className="w-full" />
                </div>
              )}
            </div>

            <button onClick={resize}
              className="w-full py-3 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl transition-colors">
              📐 Resize Image
            </button>

            <button onClick={() => { setSrc(null); setOutUrl(null); }}
              className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 underline">
              ← Use a different image
            </button>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-500 mb-2 font-medium">Preview</p>
              <img src={outUrl || src} alt="preview" className="w-full rounded-lg object-contain max-h-64" />
              {outSize && (
                <p className="text-xs text-green-600 mt-2 font-medium">
                  Output: {parseInt(width)}×{parseInt(height)}px · {fmtSize(outSize)}
                  {outSize < origSize && ` (${Math.round((1-outSize/origSize)*100)}% smaller)`}
                </p>
              )}
            </div>

            {outUrl && (
              <a href={outUrl} download={`resized.${format === 'jpeg' ? 'jpg' : format}`}
                className="block w-full py-3 text-center bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors">
                ⬇️ Download Resized Image
              </a>
            )}
          </div>
        </div>
      )}
      <CrossBrandCard pageSlug="image-resize" />
    </div>
  );
}

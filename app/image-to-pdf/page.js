'use client';
import { useState, useCallback } from 'react';

export default function ImageToPDF() {
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const addImages = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    const entries = valid.map(f => ({ file: f, url: URL.createObjectURL(f), name: f.name }));
    setImages(prev => [...prev, ...entries]);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    addImages(e.dataTransfer.files);
  }, []);

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const convert = async () => {
    if (!images.length) return;
    setLoading(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      for (const img of images) {
        const bytes = await img.file.arrayBuffer();
        let pdfImg;
        if (img.file.type === 'image/png') {
          pdfImg = await pdfDoc.embedPng(bytes);
        } else {
          pdfImg = await pdfDoc.embedJpg(bytes);
        }
        const { width, height } = pdfImg;
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(pdfImg, { x: 0, y: 0, width, height });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'converted.pdf'; a.click();
    } catch (e) { alert('Conversion failed: ' + e.message); }
    setLoading(false);
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Image to PDF Converter</h1>
      <p className="text-slate-500 mb-8 text-sm">Convert JPG, PNG, WebP images into a single PDF file. Free, fast, browser-based — your files never leave your device.</p>

      <div className="ad-slot h-20 mb-8">[ AdSense — Leaderboard ]</div>

      {/* Drop zone */}
      <div
        className={`drop-zone mb-6 ${dragging ? 'active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('img-input').click()}
      >
        <div className="text-4xl mb-3">🖼️</div>
        <p className="font-semibold text-slate-700">Drop images here or <span className="text-brand-700 underline">browse</span></p>
        <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WebP, GIF — multiple files allowed</p>
        <input id="img-input" type="file" accept="image/*" multiple className="hidden"
          onChange={e => addImages(e.target.files)} />
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-slate-700">{images.length} image{images.length > 1 ? 's' : ''} selected</p>
            <button onClick={() => setImages([])} className="text-xs text-red-500 hover:text-red-700">Clear all</button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  ×
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                  {img.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={convert} disabled={!images.length || loading}
        className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors text-base">
        {loading ? '⏳ Converting...' : '📥 Convert to PDF & Download'}
      </button>

      {/* How to use */}
      <div className="mt-10 bg-slate-50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">How to Convert Images to PDF</h2>
        <ol className="space-y-3">
          {[
            'Click the upload area or drag and drop your images.',
            'Multiple images will be combined into a single PDF, one image per page.',
            'Click "Convert to PDF & Download" — no upload to server, instant result.',
          ].map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-600">
              <span className="w-6 h-6 flex-shrink-0 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i+1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['Is this tool free?', 'Yes, completely free. No signup, no watermark, no file size limit (limited by your browser\'s memory).'],
            ['Are my images uploaded to a server?', 'No — everything runs in your browser using JavaScript. Your images never leave your device.'],
            ['Can I convert multiple images at once?', 'Yes — add as many images as you want. Each image becomes one page in the PDF.'],
            ['What image formats are supported?', 'JPG, JPEG, PNG, WebP, and GIF are supported.'],
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

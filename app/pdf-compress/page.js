'use client';
import { useState } from 'react';

export default function PDFCompress() {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f); setResult(null);
    }
  };

  const compress = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      // Re-save with compression flags — pdf-lib removes unused objects on save
      const compressed = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([compressed], { type: 'application/pdf' });

      const originalKB  = (file.size / 1024).toFixed(1);
      const compressedKB = (compressed.byteLength / 1024).toFixed(1);
      const saved = (((file.size - compressed.byteLength) / file.size) * 100).toFixed(1);

      setResult({ blob, originalKB, compressedKB, saved: Math.max(0, saved) });
    } catch (e) { alert('Compression failed: ' + e.message); }
    setLoading(false);
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(result.blob);
    a.download = 'compressed.pdf';
    a.click();
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Compress PDF</h1>
      <p className="text-slate-500 mb-8 text-sm">Reduce the file size of your PDF. Free, private, browser-based — your file is never uploaded.</p>

      <div className="ad-slot h-20 mb-8">[ AdSense — Leaderboard ]</div>

      {/* Upload */}
      {!file ? (
        <div className="drop-zone mb-6"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('comp-input').click()}>
          <div className="text-4xl mb-3">🗜️</div>
          <p className="font-semibold text-slate-700">Drop your PDF here or <span className="text-brand-700 underline">browse</span></p>
          <p className="text-xs text-slate-400 mt-1">Only PDF files accepted</p>
          <input id="comp-input" type="file" accept=".pdf" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <span className="text-3xl">📄</span>
          <div className="flex-1">
            <p className="font-semibold text-slate-700 text-sm">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={() => { setFile(null); setResult(null); }}
            className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
          <p className="font-bold text-green-800 mb-3">✅ Compression Complete!</p>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Original</p>
              <p className="font-bold text-slate-800">{result.originalKB} KB</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Compressed</p>
              <p className="font-bold text-green-700">{result.compressedKB} KB</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Saved</p>
              <p className="font-bold text-green-700">{result.saved}%</p>
            </div>
          </div>
          <button onClick={download}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors">
            📥 Download Compressed PDF
          </button>
        </div>
      )}

      <button onClick={compress} disabled={!file || loading}
        className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors text-base">
        {loading ? '⏳ Compressing...' : '🗜️ Compress PDF'}
      </button>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
        <strong>Note:</strong> This tool compresses PDFs by removing unused objects and optimizing internal structure. For image-heavy PDFs, the reduction may be modest. Scanned PDFs with large embedded images see the biggest size difference.
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['Why is my PDF not getting smaller?', 'PDFs that already contain compressed images or are already optimized may not shrink further with this method. Text-heavy PDFs compress best.'],
            ['Is quality lost when compressing?', 'Text quality is not affected. This tool does not reduce image resolution — it only removes internal redundancy.'],
            ['My PDF is still too large — what should I do?', 'For PDFs with many large images, consider reducing image resolution before creating the PDF. Adobe Acrobat\'s "Save as Optimized PDF" feature offers the deepest compression.'],
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

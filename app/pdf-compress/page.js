'use client';
import { useState } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';
import { compressPdf, MODES } from '../lib/pdfCompress';

const MODE_ORDER = ['lossless', 'flatten'];
const MAX_MB = 100;

export default function PDFCompress() {
  const [file, setFile]       = useState(null);
  const [mode, setMode]       = useState('lossless');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Please upload a PDF file.'); return; }
    if (f.size > MAX_MB * 1048576) { setError(`File too large — max ${MAX_MB} MB.`); return; }
    setError(''); setFile(f); setResult(null);
  };

  const compress = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError('');
    setProgress(mode === 'lossless' ? 'Optimizing…' : 'Preparing…');
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const out = await compressPdf(bytes, mode, (msg) => setProgress(msg));
      const blob = new Blob([out], { type: 'application/pdf' });

      const originalKB   = (file.size / 1024).toFixed(1);
      const compressedKB = (out.byteLength / 1024).toFixed(1);
      const saved = (((file.size - out.byteLength) / file.size) * 100).toFixed(1);

      setResult({ blob, originalKB, compressedKB, saved: Math.max(0, saved) });
    } catch (e) {
      setError('Compression failed: ' + (e.message || 'unknown error') + '. If this keeps happening, the PDF may be corrupt or password-protected.');
    }
    setProgress('');
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

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">⚠️ {error}</div>
      )}

      {/* Upload */}
      {!file ? (
        <div className="drop-zone mb-6"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('comp-input').click()}>
          <div className="text-4xl mb-3">🗜️</div>
          <p className="font-semibold text-slate-700">Drop your PDF here or <span className="text-brand-700 underline">browse</span></p>
          <p className="text-xs text-slate-400 mt-1">Only PDF files accepted · Max {MAX_MB} MB</p>
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

      {/* Compression mode selector */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-2">Compression level</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODE_ORDER.map(key => {
            const m = MODES[key];
            const active = mode === key;
            return (
              <button key={key} type="button" onClick={() => setMode(key)}
                className={`text-left rounded-xl border px-3 py-2.5 transition-colors ${
                  active ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-200 bg-white hover:border-brand-300'
                }`}>
                <p className={`text-sm font-bold ${active ? 'text-brand-700' : 'text-slate-700'}`}>{m.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{m.sub}</p>
              </button>
            );
          })}
        </div>

        {mode === 'flatten' && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
            <strong>Heads up:</strong> Strong mode turns every page into an image. The file gets much smaller, but the text is no longer selectable or searchable. Choose Lossless to keep text.
          </div>
        )}
        {mode === 'lossless' && (
          <p className="mt-2 text-[11px] text-slate-400">
            Nothing is re-encoded — unused objects are dropped and the file structure is rewritten more efficiently. How much this saves depends on how the PDF was originally produced.
          </p>
        )}
      </div>

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
          {Number(result.saved) === 0 && (
            <p className="text-xs text-amber-600 mb-3">
              {mode === 'lossless'
                ? 'This PDF is already structurally efficient, so lossless cleanup found nothing to remove. Strong mode will reduce it, at the cost of selectable text.'
                : 'This PDF is already about as small as this tool can make it.'}
            </p>
          )}
          <button onClick={download}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors">
            📥 Download Compressed PDF
          </button>
        </div>
      )}

      <button onClick={compress} disabled={!file || loading}
        className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors text-base">
        {loading ? `⏳ ${progress || 'Compressing…'}` : '🗜️ Compress PDF'}
      </button>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
        <strong>Note:</strong> <em>Lossless</em> rewrites the file structure and drops unused objects. Nothing is re-encoded, so quality and selectable text are untouched — but on an already well-built PDF the saving can be small. <em>Strong</em> renders each page to an image, which reliably shrinks scanned and image-heavy documents at the cost of selectable text.
      </div>

      <CrossBrandCard pageSlug="pdf-compress" />
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['Which mode should I use?', 'Try Lossless first — it never changes how the document looks and keeps text selectable. If the saving is too small and you do not need to select or search the text afterwards, use Strong, which rasterises each page and shrinks scanned or image-heavy PDFs substantially.'],
            ['Why did Lossless barely reduce my file?', 'Lossless only removes waste in the file structure — unused objects and inefficient layout. It never re-encodes images, which is where most of the size usually sits. A PDF exported by a modern tool is often already efficient in that respect, so there is little to reclaim. Strong mode is the option that reduces image data.'],
            ['Does compression reduce quality?', 'Lossless does not touch quality at all. Strong re-renders each page as a JPEG image, so fine detail and small text soften slightly — the trade for a much smaller file.'],
            ['Will my text stay selectable?', 'In Lossless mode, yes — the page content is untouched. In Strong mode, no: each page becomes an image, so text can no longer be selected, searched or copied.'],
            ['Is my file uploaded anywhere?', 'No. Everything runs inside your browser — including the compression engine — so your PDF never leaves your device.'],
          ].map(([q, a]) => (
            <details key={q} className="faq-item bg-white border border-slate-100 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 font-semibold text-slate-700 text-sm flex justify-between items-center">
                {q}<span className="text-brand-600 text-lg faq-icon"></span>
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-600">{a}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

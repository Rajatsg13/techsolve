'use client';
import { useState } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';

const MAX_FILES      = 20;
const MAX_FILE_MB    = 30;          // per file
const MAX_TOTAL_MB   = 100;         // total across all files
const MAX_FILE_BYTES  = MAX_FILE_MB  * 1024 * 1024;
const MAX_TOTAL_BYTES = MAX_TOTAL_MB * 1024 * 1024;

const fmtSize = (bytes) => {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
};

export default function PDFMerge() {
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors]   = useState([]);

  const totalBytes = files.reduce((sum, f) => sum + f.file.size, 0);
  const totalPct   = Math.min(100, (totalBytes / MAX_TOTAL_BYTES) * 100);
  const barColor   = totalPct > 80 ? 'bg-red-500' : totalPct > 60 ? 'bg-amber-400' : 'bg-green-500';

  const addFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => f.type === 'application/pdf');
    const errs = [];
    const valid = [];

    for (const f of pdfs) {
      if (files.length + valid.length >= MAX_FILES) {
        errs.push(`Max ${MAX_FILES} files allowed — skipped "${f.name}".`);
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        errs.push(`"${f.name}" is ${fmtSize(f.size)} — max per file is ${MAX_FILE_MB} MB.`);
        continue;
      }
      const projectedTotal = totalBytes + valid.reduce((s, v) => s + v.file.size, 0) + f.size;
      if (projectedTotal > MAX_TOTAL_BYTES) {
        errs.push(`Adding "${f.name}" would exceed the ${MAX_TOTAL_MB} MB total limit.`);
        continue;
      }
      valid.push({ file: f, name: f.name, bytes: f.size });
    }

    setErrors(errs);
    if (valid.length) setFiles(prev => [...prev, ...valid]);
  };

  const moveUp   = (i) => setFiles(f => { const a = [...f]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; });
  const moveDown = (i) => setFiles(f => { const a = [...f]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; });
  const remove   = (i) => { setErrors([]); setFiles(f => f.filter((_, idx) => idx !== i)); };

  const merge = async () => {
    if (files.length < 2) { setErrors(['Please add at least 2 PDF files.']); return; }
    setLoading(true);
    setErrors([]);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const merged = await PDFDocument.create();
      for (const { file } of files) {
        const bytes = await file.arrayBuffer();
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const out  = await merged.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'merged.pdf';
      a.click();
    } catch (e) {
      setErrors(['Merge failed: ' + e.message]);
    }
    setLoading(false);
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Merge PDF Files</h1>
      <p className="text-slate-500 mb-2 text-sm">Combine multiple PDFs into one. Reorder pages before merging. 100% private — runs in your browser.</p>

      {/* Limits badge */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[`Up to ${MAX_FILES} files`, `${MAX_FILE_MB} MB per file`, `${MAX_TOTAL_MB} MB total`].map(t => (
          <span key={t} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 rounded-full px-3 py-1">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            {t}
          </span>
        ))}
      </div>


      {/* Error messages */}
      {errors.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
          {errors.map((e, i) => (
            <p key={i} className="text-sm text-red-700 flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>{e}
            </p>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div className={`drop-zone mb-6 ${dragging ? 'active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => document.getElementById('pdf-input').click()}>
        <div className="text-4xl mb-3">📂</div>
        <p className="font-semibold text-slate-700">Drop PDF files here or <span className="text-brand-700 underline">browse</span></p>
        <p className="text-xs text-slate-400 mt-1">Add 2–{MAX_FILES} PDFs · max {MAX_FILE_MB} MB each · {MAX_TOTAL_MB} MB total</p>
        <input id="pdf-input" type="file" accept=".pdf" multiple className="hidden"
          onChange={e => addFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <>
          {/* Total size bar */}
          <div className="mb-4 bg-white border border-slate-200 rounded-xl px-4 py-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Total size: <strong className="text-slate-700">{fmtSize(totalBytes)}</strong></span>
              <span>Limit: {MAX_TOTAL_MB} MB</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${totalPct}%` }} />
            </div>
            {totalPct > 80 && (
              <p className="text-xs text-amber-600 mt-1.5">Approaching limit — remove large files if merge is slow.</p>
            )}
          </div>

          <div className="mb-6 space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
                <span className="text-2xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{f.name}</p>
                  <p className="text-xs text-slate-400">{fmtSize(f.bytes)}</p>
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
        </>
      )}

      <button onClick={merge} disabled={files.length < 2 || loading}
        className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors text-base">
        {loading ? '⏳ Merging — this may take a moment for large files…' : `🔗 Merge ${files.length} PDF${files.length !== 1 ? 's' : ''} & Download`}
      </button>

      {loading && (
        <p className="text-center text-xs text-slate-400 mt-2">Processing happens entirely in your browser. Large files may take 10–30 seconds.</p>
      )}

      <div className="mt-10 bg-slate-50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">How to Merge PDFs</h2>
        <ol className="space-y-3">
          {[
            'Upload 2 or more PDF files using the button above.',
            'Reorder files using the ↑ ↓ arrows — the order here is the page order in the merged PDF.',
            'Click Merge and your combined PDF downloads instantly.',
          ].map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-600">
              <span className="w-6 h-6 flex-shrink-0 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i+1}</span>{s}
            </li>
          ))}
        </ol>
      </div>

      <CrossBrandCard pageSlug="pdf-merge" />
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['How many PDFs can I merge?', `You can merge up to ${MAX_FILES} PDFs at once. Need more? Download the merged file, then merge it again with additional files.`],
            ['Is there a file size limit?', `Yes — max ${MAX_FILE_MB} MB per file and ${MAX_TOTAL_MB} MB total. This ensures reliable merging across all devices and browsers. For very large catalogs (100 MB+), consider splitting them first using our PDF Compress tool.`],
            ['Will the merged PDF lose quality?', 'No — pdf-lib copies pages at their original resolution. No re-compression or quality loss occurs.'],
            ['Is my data safe?', 'Yes. Everything runs inside your browser — your files are never uploaded to any server.'],
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

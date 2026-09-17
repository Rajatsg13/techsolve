'use client';
import { useState, useCallback } from 'react';
import ToolShell, { ErrorBanner } from '../components/tool-ui/ToolShell';
import FileDropZone, { FileChip } from '../components/tool-ui/FileDropZone';
import { getToolContent } from '../content/tools';
import { loadPageThumbnails, normaliseRotation } from '../lib/pdfPages';
import { downloadBytes } from '../lib/download';
import { withExtension } from '../lib/download';

const content = getToolContent('pdf-rotate');
const MAX_MB = 100;

export default function PdfRotate() {
  const [file, setFile] = useState(null);
  const [bytes, setBytes] = useState(null);
  const [pages, setPages] = useState([]);
  const [rotations, setRotations] = useState({});   // pageIndex -> 0/90/180/270
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const onFiles = useCallback(async ([f]) => {
    setError(''); setBusy(true); setPages([]); setRotations({});
    try {
      const buf = new Uint8Array(await f.arrayBuffer());
      setBytes(buf);
      const { pages: rendered } = await loadPageThumbnails(
        buf, (done, total) => setProgress(`Reading page ${done} of ${total}…`));
      setPages(rendered);
      setFile(f);
      setProgress('');
    } catch (e) {
      setError(e?.message || 'That PDF could not be opened. It may be damaged or password protected.');
      setFile(null); setBytes(null);
    }
    setBusy(false);
  }, []);

  const rotate = (index, delta) =>
    setRotations(r => ({ ...r, [index]: normaliseRotation((r[index] || 0) + delta) }));

  const rotateAll = (delta) =>
    setRotations(r => {
      const next = {};
      pages.forEach(p => { next[p.index] = normaliseRotation((r[p.index] || 0) + delta); });
      return next;
    });

  const resetAll = () => setRotations({});

  const changed = pages.filter(p => (rotations[p.index] || 0) !== 0).length;

  const save = async () => {
    setBusy(true); setError('');
    try {
      const { PDFDocument, degrees } = await import('pdf-lib');
      // Loading and re-saving the same document keeps every page object as it
      // was — this only changes each page's /Rotate entry, so text stays text
      // and nothing is rasterised.
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      doc.getPages().forEach((page, i) => {
        const extra = rotations[i] || 0;
        if (!extra) return;
        const current = page.getRotation().angle || 0;
        page.setRotation(degrees(normaliseRotation(current + extra)));
      });
      const out = await doc.save();
      downloadBytes(out, withExtension(file.name.replace(/\.pdf$/i, '') + '-rotated', 'pdf'), 'application/pdf');
    } catch (e) {
      setError(e?.message || 'The rotated PDF could not be created.');
    }
    setBusy(false);
  };

  const reset = () => { setFile(null); setBytes(null); setPages([]); setRotations({}); setError(''); };

  return (
    <ToolShell
      slug="pdf-rotate"
      title="Rotate PDF"
      outcome="Turn sideways or upside-down pages the right way up, and save the PDF with the text still text."
      content={content}
    >
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {!file && (
        <FileDropZone
          accept=".pdf" mimeTypes={['application/pdf']} maxMB={MAX_MB}
          onFiles={onFiles} onError={setError}
          label="Drop a PDF here or" hint={`PDF · max ${MAX_MB} MB · up to 200 pages`}
        />
      )}
      {busy && progress && <p className="text-sm text-ink-500 mt-4" data-testid="progress">{progress}</p>}

      {file && pages.length > 0 && (
        <div className="space-y-5">
          <FileChip name={file.name} size={file.size} icon="📄" onRemove={reset} />

          <div className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink-800 mr-1">All pages:</span>
              <button onClick={() => rotateAll(-90)} data-testid="all-left"
                className="px-3 py-2 rounded-lg border border-ink-200 text-sm font-medium hover:bg-ink-50">↺ Left</button>
              <button onClick={() => rotateAll(90)} data-testid="all-right"
                className="px-3 py-2 rounded-lg border border-ink-200 text-sm font-medium hover:bg-ink-50">↻ Right</button>
              <button onClick={() => rotateAll(180)} data-testid="all-180"
                className="px-3 py-2 rounded-lg border border-ink-200 text-sm font-medium hover:bg-ink-50">180°</button>
              <button onClick={resetAll} data-testid="reset-all"
                className="px-3 py-2 rounded-lg border border-ink-200 text-sm font-medium hover:bg-ink-50 ml-auto">Reset</button>
            </div>
            <p className="text-xs text-ink-500 mt-2" data-testid="changed-count">
              {changed === 0 ? 'No pages rotated yet.' : `${changed} of ${pages.length} pages will be rotated.`}
            </p>
          </div>

          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="page-grid">
            {pages.map(p => {
              const deg = rotations[p.index] || 0;
              return (
                <li key={p.index}
                    className={`bg-white border rounded-xl p-3 ${deg ? 'border-brand-400 ring-1 ring-brand-200' : 'border-ink-100'}`}
                    data-testid={`page-${p.index}`} data-rotation={deg}>
                  <div className="aspect-[3/4] grid place-items-center overflow-hidden mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumb} alt={`Page ${p.index + 1}`}
                      className="max-w-full max-h-full object-contain transition-transform duration-200"
                      style={{ transform: `rotate(${deg}deg)` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-ink-500">
                      {p.index + 1}
                      {deg ? <span className="ml-1 font-semibold text-brand-700">{deg}°</span> : null}
                    </span>
                    <span className="flex gap-1">
                      <button onClick={() => rotate(p.index, -90)} aria-label={`Rotate page ${p.index + 1} left`}
                        data-testid={`left-${p.index}`}
                        className="w-8 h-8 rounded-lg border border-ink-200 text-sm hover:bg-ink-50">↺</button>
                      <button onClick={() => rotate(p.index, 90)} aria-label={`Rotate page ${p.index + 1} right`}
                        data-testid={`right-${p.index}`}
                        className="w-8 h-8 rounded-lg border border-ink-200 text-sm hover:bg-ink-50">↻</button>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            onClick={save} disabled={busy || changed === 0}
            data-testid="save"
            className="w-full py-3.5 rounded-xl bg-ink-900 text-white font-semibold text-sm
                       hover:bg-ink-800 disabled:bg-ink-300 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? 'Saving…' : changed === 0 ? 'Rotate a page to continue' : 'Download rotated PDF'}
          </button>
          <p className="text-xs text-ink-400 text-center">
            Rotated in your browser. Your document is never uploaded.
          </p>
        </div>
      )}
    </ToolShell>
  );
}

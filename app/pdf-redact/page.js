'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import ToolShell, { ToolNotice, ErrorBanner } from '../components/tool-ui/ToolShell';
import FileDropZone, { FileChip } from '../components/tool-ui/FileDropZone';
import { SelectField } from '../components/tool-ui/Field';
import { getToolContent } from '../content/tools';
import { loadPageThumbnails, renderPageForEditing, clampFraction } from '../lib/pdfPages';
import { openPdf, renderPageToCanvas, canvasToJpeg, yieldToBrowser } from '../lib/pdfRender';
import { downloadBytes, withExtension } from '../lib/download';

const content = getToolContent('pdf-redact');
const MAX_MB = 100;
const EXPORT_DPI = 150;   // resolution of the rebuilt, redacted pages

export default function PdfRedact() {
  const [file, setFile] = useState(null);
  const [bytes, setBytes] = useState(null);
  const [pages, setPages] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [preview, setPreview] = useState(null);
  const [boxes, setBoxes] = useState({});      // pageIndex -> [{x,y,width,height} as fractions]
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const [draft, setDraft] = useState(null);

  const onFiles = useCallback(async ([f]) => {
    setError(''); setBusy(true); setBoxes({});
    try {
      const buf = new Uint8Array(await f.arrayBuffer());
      setBytes(buf);
      const { pages: rendered } = await loadPageThumbnails(buf);
      setPages(rendered);
      setPageIndex(0);
      setPreview(await renderPageForEditing(buf, 0));
      setFile(f);
    } catch (e) {
      setError(e?.message || 'That PDF could not be opened. It may be damaged or password protected.');
      setFile(null); setBytes(null);
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!bytes || !pages.length) return;
    let cancelled = false;
    (async () => {
      try {
        const p = await renderPageForEditing(bytes, pageIndex);
        if (!cancelled) setPreview(p);
      } catch { /* preview only */ }
    })();
    return () => { cancelled = true; };
  }, [bytes, pageIndex, pages.length]);

  /* ── Drawing redaction boxes ─────────────────────────────────────────── */
  const frac = (e) => {
    const r = frameRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };
  const startBox = (e) => {
    if (e.target.dataset?.role === 'remove') return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = frac(e);
    dragRef.current = { start: p };
    setDraft({ x: p.x, y: p.y, width: 0, height: 0 });
  };
  const moveBox = (e) => {
    if (!dragRef.current) return;
    const p = frac(e);
    const s = dragRef.current.start;
    setDraft({
      x: Math.min(s.x, p.x), y: Math.min(s.y, p.y),
      width: Math.abs(p.x - s.x), height: Math.abs(p.y - s.y),
    });
  };
  const endBox = (e) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDraft(d => {
      // Ignore an accidental click: a redaction has to have real area.
      if (d && d.width > 0.01 && d.height > 0.008) {
        const box = clampFraction(d);
        setBoxes(b => ({ ...b, [pageIndex]: [...(b[pageIndex] || []), box] }));
      }
      return null;
    });
  };

  const removeBox = (page, i) =>
    setBoxes(b => ({ ...b, [page]: (b[page] || []).filter((_, k) => k !== i) }));
  const clearPage = () => setBoxes(b => ({ ...b, [pageIndex]: [] }));
  const clearAll = () => setBoxes({});

  const pageBoxes = boxes[pageIndex] || [];
  const totalBoxes = Object.values(boxes).reduce((s, arr) => s + arr.length, 0);
  const redactedPages = Object.keys(boxes).filter(k => boxes[k]?.length).map(Number).sort((a, b) => a - b);

  /* ── Export ──────────────────────────────────────────────────────────── */
  const save = async () => {
    setBusy(true); setError(''); setProgress('');
    try {
      const { PDFDocument, rgb } = await import('pdf-lib');
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const doc = await openPdf(bytes);
      const redactSet = new Set(redactedPages);

      for (let i = 0; i < pages.length; i++) {
        setProgress(`Processing page ${i + 1} of ${pages.length}…`);

        if (!redactSet.has(i)) {
          // Untouched pages are copied across unchanged, so they keep their
          // text, links and selectability. Only pages carrying a redaction pay
          // the rasterisation cost.
          const [copied] = await out.copyPages(src, [i]);
          out.addPage(copied);
          await yieldToBrowser();
          continue;
        }

        // A redacted page is rebuilt from pixels. The original page object is
        // never copied into the output, so the text under a black box is not
        // present in the file in any form — it was never written.
        const page = await doc.getPage(i + 1);
        const { canvas } = await renderPageToCanvas(page, EXPORT_DPI);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        for (const b of boxes[i]) {
          ctx.fillRect(
            Math.floor(b.x * canvas.width), Math.floor(b.y * canvas.height),
            Math.ceil(b.width * canvas.width), Math.ceil(b.height * canvas.height),
          );
        }
        const jpeg = await canvasToJpeg(canvas, 0.9);
        const embedded = await out.embedJpg(jpeg);
        // Size the new page to the rendered viewport, which already accounts for
        // any rotation the original page declared.
        const viewport = page.getViewport({ scale: 1 });
        const newPage = out.addPage([viewport.width, viewport.height]);
        newPage.drawImage(embedded, { x: 0, y: 0, width: viewport.width, height: viewport.height });

        // The pixels underneath were already painted black before the image was
        // encoded, so the content is gone either way. This vector rectangle sits
        // on top so the region is exactly #000 rather than JPEG's approximation
        // of it — no faint mottling that might leave a reader wondering whether
        // something is still showing through.
        for (const b of boxes[i]) {
          newPage.drawRectangle({
            x: b.x * viewport.width,
            y: (1 - b.y - b.height) * viewport.height,
            width: b.width * viewport.width,
            height: b.height * viewport.height,
            color: rgb(0, 0, 0),
          });
        }
        await yieldToBrowser();
      }

      const saved = await out.save();
      downloadBytes(saved, withExtension(file.name.replace(/\.pdf$/i, '') + '-redacted', 'pdf'), 'application/pdf');
      setProgress('');
    } catch (e) {
      setError(e?.message || 'The redacted PDF could not be created.');
    }
    setBusy(false);
  };

  const reset = () => { setFile(null); setBytes(null); setPages([]); setPreview(null); setBoxes({}); setError(''); };

  return (
    <ToolShell
      slug="pdf-redact"
      title="Redact PDF"
      outcome="Remove sensitive content from a PDF so it cannot be selected, searched or copied out again."
      notice={
        <ToolNotice>
          Pages you redact are <strong>converted to images</strong>. That is what genuinely removes the hidden
          text — but it also means those pages are no longer selectable or searchable. Pages you do not
          redact are left untouched and keep their text.
        </ToolNotice>
      }
      content={content}
    >
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {!file && (
        <FileDropZone
          accept=".pdf" mimeTypes={['application/pdf']} maxMB={MAX_MB}
          onFiles={onFiles} onError={setError}
          label="Drop a PDF here or" hint={`PDF · max ${MAX_MB} MB`}
        />
      )}

      {file && preview && (
        <div className="space-y-5">
          <FileChip name={file.name} size={file.size} icon="📄" onRemove={reset} />

          <div className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card">
            <div className="flex flex-wrap items-end gap-3 mb-3">
              <SelectField
                id="rd-page" label="Page" value={String(pageIndex)} onChange={v => setPageIndex(Number(v))}
                options={pages.map(p => ({
                  value: String(p.index),
                  label: `Page ${p.index + 1}${boxes[p.index]?.length ? ` — ${boxes[p.index].length} redaction${boxes[p.index].length > 1 ? 's' : ''}` : ''}`,
                }))}
              />
              <button onClick={clearPage} disabled={!pageBoxes.length} data-testid="clear-page"
                className="px-3 py-2.5 rounded-lg border border-ink-200 text-sm font-medium hover:bg-ink-50 disabled:opacity-40">
                Clear this page
              </button>
              <button onClick={clearAll} disabled={!totalBoxes} data-testid="clear-all"
                className="px-3 py-2.5 rounded-lg border border-ink-200 text-sm font-medium hover:bg-ink-50 disabled:opacity-40">
                Clear all
              </button>
            </div>

            <div
              ref={frameRef}
              className="relative select-none touch-none mx-auto cursor-crosshair"
              data-testid="redact-frame"
              onPointerDown={startBox} onPointerMove={moveBox}
              onPointerUp={endBox} onPointerCancel={endBox}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.dataUrl} alt={`Page ${pageIndex + 1}`}
                   className="w-full block rounded-lg border border-ink-100 pointer-events-none" draggable={false} />

              {pageBoxes.map((b, i) => (
                <div key={i} data-testid={`box-${i}`}
                     className="absolute bg-black border border-red-400"
                     style={{ left: `${b.x*100}%`, top: `${b.y*100}%`, width: `${b.width*100}%`, height: `${b.height*100}%` }}>
                  <button
                    data-role="remove" data-testid={`remove-${i}`}
                    onPointerDown={e => { e.stopPropagation(); }}
                    onClick={e => { e.stopPropagation(); removeBox(pageIndex, i); }}
                    aria-label={`Remove redaction ${i + 1}`}
                    className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-white border border-red-500 text-red-600 text-[11px] leading-none grid place-items-center"
                  >×</button>
                </div>
              ))}

              {draft && draft.width > 0 && (
                <div className="absolute bg-black/70 border-2 border-red-500 pointer-events-none"
                     style={{ left: `${draft.x*100}%`, top: `${draft.y*100}%`, width: `${draft.width*100}%`, height: `${draft.height*100}%` }} />
              )}
            </div>

            <p className="text-xs text-ink-400 text-center mt-3" data-testid="redact-count">
              {totalBoxes === 0
                ? 'Drag across the page to mark something for removal.'
                : `${totalBoxes} redaction${totalBoxes > 1 ? 's' : ''} across ${redactedPages.length} page${redactedPages.length > 1 ? 's' : ''}. Those pages will become images.`}
            </p>
          </div>

          {busy && progress && <p className="text-sm text-ink-500" data-testid="progress">{progress}</p>}

          <button
            onClick={save} disabled={busy || totalBoxes === 0}
            data-testid="save"
            className="w-full py-3.5 rounded-xl bg-ink-900 text-white font-semibold text-sm
                       hover:bg-ink-800 disabled:bg-ink-300 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? 'Redacting…' : totalBoxes === 0 ? 'Mark something to redact' : 'Download redacted PDF'}
          </button>
          <p className="text-xs text-ink-400 text-center">
            Redacted in your browser. Your document is never uploaded.
          </p>
        </div>
      )}
    </ToolShell>
  );
}

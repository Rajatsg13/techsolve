'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import ToolShell, { ToolNotice, ErrorBanner } from '../components/tool-ui/ToolShell';
import FileDropZone, { FileChip } from '../components/tool-ui/FileDropZone';
import { SelectField, TextField, ModeTabs } from '../components/tool-ui/Field';
import { getToolContent } from '../content/tools';
import { loadPageThumbnails, renderPageForEditing, clampFraction, toPdfRect, parsePageRange } from '../lib/pdfPages';
import { downloadBytes, withExtension } from '../lib/download';

const content = getToolContent('pdf-sign');
const MAX_MB = 100;

const SCRIPT_FONTS = [
  { id: 'cursive', label: 'Handwritten', css: '"Segoe Script","Bradley Hand","Snell Roundhand",cursive' },
  { id: 'serif',   label: 'Formal',      css: 'Georgia,"Times New Roman",serif' },
  { id: 'sans',    label: 'Plain',       css: '"Helvetica Neue",Arial,sans-serif' },
];

/** Render a typed name to a transparent PNG at print resolution. */
function typedSignaturePng(text, fontCss, colour) {
  const scale = 4;                       // 4x so it stays crisp when scaled into the PDF
  const fontSize = 64;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = `${fontSize}px ${fontCss}`;
  const width = Math.max(40, Math.ceil(probe.measureText(text).width) + 40);
  const height = Math.ceil(fontSize * 1.8);

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.font = `${fontSize}px ${fontCss}`;
  ctx.fillStyle = colour;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 20, height / 2);
  return { canvas, aspect: width / height };
}

/**
 * Crop a drawing canvas down to the ink actually on it.
 *
 * Without this, the whole pad is mapped into the placement box, so a signature
 * drawn in one corner arrives tiny and off-centre while most of the box is
 * empty transparent pixels. Returns null when nothing has been drawn.
 */
function trimToInk(source, padding = 8) {
  const ctx = source.getContext('2d');
  const { width, height } = source;
  const { data } = ctx.getImageData(0, 0, width, height);
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {          // alpha channel
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  minX = Math.max(0, minX - padding); minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding); maxY = Math.min(height - 1, maxY + padding);

  const out = document.createElement('canvas');
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext('2d').drawImage(source, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

export default function PdfSign() {
  const [file, setFile] = useState(null);
  const [bytes, setBytes] = useState(null);
  const [pages, setPages] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [mode, setMode] = useState('type');
  const [typed, setTyped] = useState('');
  const [fontId, setFontId] = useState('cursive');
  const [colour, setColour] = useState('#0b1b3a');
  const [applyTo, setApplyTo] = useState('current');
  const [pageRange, setPageRange] = useState('');

  // Placement as fractions of the page, so it survives any display size.
  const [rect, setRect] = useState({ x: 0.55, y: 0.78, width: 0.32, height: 0.10 });

  const drawRef = useRef(null);
  const drawnRef = useRef(false);
  const frameRef = useRef(null);
  const dragRef = useRef(null);

  const onFiles = useCallback(async ([f]) => {
    setError(''); setBusy(true);
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

  /* ── Drawing pad ─────────────────────────────────────────────────────── */
  const padPoint = (e) => {
    const c = drawRef.current;
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  };
  const startStroke = (e) => {
    e.preventDefault();
    const c = drawRef.current;
    c.setPointerCapture?.(e.pointerId);
    const ctx = c.getContext('2d');
    ctx.strokeStyle = colour;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const p = padPoint(e);
    ctx.moveTo(p.x, p.y);
    dragRef.current = { drawing: true };
  };
  const moveStroke = (e) => {
    if (!dragRef.current?.drawing) return;
    const ctx = drawRef.current.getContext('2d');
    const p = padPoint(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    drawnRef.current = true;
  };
  const endStroke = () => { dragRef.current = null; };
  const clearPad = () => {
    const c = drawRef.current;
    if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
    drawnRef.current = false;
  };

  /* ── Placement dragging ──────────────────────────────────────────────── */
  const startPlace = (e, kind) => {
    e.preventDefault(); e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const frame = frameRef.current.getBoundingClientRect();
    dragRef.current = { kind, startX: e.clientX, startY: e.clientY, origin: { ...rect }, frame };
  };
  const movePlace = (e) => {
    const d = dragRef.current;
    if (!d || !d.kind) return;
    const dx = (e.clientX - d.startX) / d.frame.width;
    const dy = (e.clientY - d.startY) / d.frame.height;
    if (d.kind === 'move') {
      setRect(clampFraction({ ...d.origin, x: d.origin.x + dx, y: d.origin.y + dy }));
    } else {
      setRect(clampFraction({
        ...d.origin,
        width: Math.max(0.05, d.origin.width + dx),
        height: Math.max(0.03, d.origin.height + dy),
      }));
    }
  };
  const endPlace = (e) => { dragRef.current = null; e.currentTarget.releasePointerCapture?.(e.pointerId); };

  /* ── Export ──────────────────────────────────────────────────────────── */
  const targetPages = () => {
    if (applyTo === 'all') return pages.map(p => p.index);
    if (applyTo === 'range') return parsePageRange(pageRange, pages.length);
    return [pageIndex];
  };

  const save = async () => {
    setBusy(true); setError('');
    try {
      let png;
      if (mode === 'type') {
        if (!typed.trim()) throw new Error('Type your name first.');
        const font = SCRIPT_FONTS.find(f => f.id === fontId).css;
        png = typedSignaturePng(typed.trim(), font, colour).canvas;
      } else {
        if (!drawnRef.current) throw new Error('Draw your signature first.');
        png = trimToInk(drawRef.current);
        if (!png) throw new Error('Draw your signature first.');
      }
      const blob = await new Promise((res, rej) =>
        png.toBlob(b => b ? res(b) : rej(new Error('Could not create the signature image.')), 'image/png'));
      const pngBytes = new Uint8Array(await blob.arrayBuffer());

      const targets = targetPages();
      if (!targets.length) throw new Error('No pages selected. Check the page numbers.');

      const { PDFDocument } = await import('pdf-lib');
      // The original document is loaded and re-saved: only a signature image is
      // drawn onto the chosen pages. Nothing is rasterised, so the rest of the
      // document keeps its text and structure.
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const image = await doc.embedPng(pngBytes);
      const docPages = doc.getPages();

      for (const index of targets) {
        const page = docPages[index];
        if (!page) continue;
        const { width, height } = page.getSize();
        const r = toPdfRect(rect, width, height);
        page.drawImage(image, { x: r.x, y: r.y, width: r.width, height: r.height });
      }

      const out = await doc.save();
      downloadBytes(out, withExtension(file.name.replace(/\.pdf$/i, '') + '-signed', 'pdf'), 'application/pdf');
    } catch (e) {
      setError(e?.message || 'The signed PDF could not be created.');
    }
    setBusy(false);
  };

  const reset = () => { setFile(null); setBytes(null); setPages([]); setPreview(null); setError(''); };
  const canSave = mode === 'type' ? typed.trim().length > 0 : true;

  return (
    <ToolShell
      slug="pdf-sign"
      title="Sign PDF"
      outcome="Place a visible signature on a PDF — typed or drawn — and download it, without flattening the rest of the document."
      notice={
        <ToolNotice>
          This adds a <strong>visible signature mark</strong> to the page, the digital equivalent of signing
          a printout. It is not a certified or cryptographic digital signature: nothing here verifies your
          identity or seals the document against later changes.
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

          <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-card space-y-4" data-testid="sign-builder">
            <ModeTabs
              value={mode} onChange={setMode} label="Signature type"
              options={[{ value: 'type', label: 'Type it' }, { value: 'draw', label: 'Draw it' }]}
            />

            {mode === 'type' ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <TextField id="sg-name" label="Your name" value={typed} onChange={setTyped} placeholder="A. Sharma" />
                <SelectField id="sg-font" label="Style" value={fontId} onChange={setFontId}
                  options={SCRIPT_FONTS.map(f => ({ value: f.id, label: f.label }))} />
                <div className="sm:col-span-2">
                  <p className="text-xs text-ink-500 mb-1.5">Preview</p>
                  <div className="border border-ink-200 rounded-xl bg-white px-4 py-3 min-h-[64px] flex items-center overflow-x-auto"
                       data-testid="typed-preview">
                    <span style={{
                      fontFamily: SCRIPT_FONTS.find(f => f.id === fontId).css,
                      fontSize: 34, color: colour, whiteSpace: 'nowrap',
                    }}>{typed || 'Your signature'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-ink-800 mb-1.5">Draw your signature</p>
                <canvas
                  ref={drawRef} width={800} height={240} data-testid="draw-pad"
                  onPointerDown={startStroke} onPointerMove={moveStroke}
                  onPointerUp={endStroke} onPointerLeave={endStroke} onPointerCancel={endStroke}
                  className="w-full border-2 border-dashed border-ink-200 rounded-xl bg-white touch-none cursor-crosshair"
                  style={{ aspectRatio: '10 / 3' }}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-ink-400">Use a finger on a phone, or the mouse on a computer.</p>
                  <button onClick={clearPad} data-testid="clear-pad"
                    className="text-xs font-semibold text-ink-600 hover:text-ink-900">Clear</button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <label htmlFor="sg-colour" className="text-sm font-semibold text-ink-800">Ink colour</label>
              <input id="sg-colour" type="color" value={colour} onChange={e => setColour(e.target.value)}
                className="w-10 h-9 rounded border border-ink-200 bg-white" />
            </div>
          </div>

          <div className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <SelectField
                id="sg-page" label="Page to preview"
                value={String(pageIndex)} onChange={v => setPageIndex(Number(v))}
                options={pages.map(p => ({ value: String(p.index), label: `Page ${p.index + 1}` }))}
              />
              <SelectField
                id="sg-apply" label="Add signature to" value={applyTo} onChange={setApplyTo}
                options={[
                  { value: 'current', label: 'This page only' },
                  { value: 'all', label: 'Every page' },
                  { value: 'range', label: 'Specific pages' },
                ]}
              />
              {applyTo === 'range' && (
                <TextField id="sg-range" label="Pages" value={pageRange} onChange={setPageRange} placeholder="1, 3, 5-7" />
              )}
            </div>

            <div ref={frameRef} className="relative select-none touch-none mx-auto"
                 onPointerMove={movePlace} onPointerUp={endPlace} onPointerCancel={endPlace}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.dataUrl} alt={`Page ${pageIndex + 1}`}
                   className="w-full block rounded-lg border border-ink-100 pointer-events-none" draggable={false} />
              <div
                className="absolute border-2 border-brand-500 bg-brand-500/10 cursor-move grid place-items-center overflow-hidden"
                style={{
                  left: `${rect.x * 100}%`, top: `${rect.y * 100}%`,
                  width: `${rect.width * 100}%`, height: `${rect.height * 100}%`,
                }}
                data-testid="sig-box"
                onPointerDown={e => startPlace(e, 'move')}
              >
                {mode === 'type' && typed && (
                  <span className="pointer-events-none whitespace-nowrap px-1"
                        style={{ fontFamily: SCRIPT_FONTS.find(f => f.id === fontId).css, color: colour, fontSize: '1rem' }}>
                    {typed}
                  </span>
                )}
                <span
                  onPointerDown={e => startPlace(e, 'resize')}
                  data-testid="sig-resize"
                  aria-label="Resize signature"
                  role="button"
                  className="absolute -right-2.5 -bottom-2.5 w-5 h-5 rounded-full bg-white border-2 border-brand-600"
                  style={{ cursor: 'nwse-resize', touchAction: 'none' }}
                />
              </div>
            </div>
            <p className="text-xs text-ink-400 text-center mt-3">
              Drag the box to position the signature, or drag its corner to resize.
            </p>
          </div>

          <button
            onClick={save} disabled={busy || !canSave}
            data-testid="save"
            className="w-full py-3.5 rounded-xl bg-ink-900 text-white font-semibold text-sm
                       hover:bg-ink-800 disabled:bg-ink-300 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? 'Adding signature…' : 'Download signed PDF'}
          </button>
          <p className="text-xs text-ink-400 text-center">
            Signed in your browser. Your document is never uploaded.
          </p>
        </div>
      )}
    </ToolShell>
  );
}

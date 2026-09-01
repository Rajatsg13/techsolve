'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import ToolShell, { ErrorBanner } from '../components/tool-ui/ToolShell';
import FileDropZone, { FileChip } from '../components/tool-ui/FileDropZone';
import { SelectField, NumberField } from '../components/tool-ui/Field';
import { getToolContent } from '../content/tools';
import { decodeImage, cropImage } from '../lib/imageCanvas';
import {
  ASPECT_RATIOS, getAspectRatio, applyAspectRatio, clampCrop, centredCrop,
  cropProblem, OUTPUT_FORMATS, getFormat, defaultFormatFor, retargetFilename,
} from '../lib/image';
import { downloadBlob, formatBytes } from '../lib/download';

const content = getToolContent('image-crop');
const MAX_MB = 50;
const ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,.bmp';
const MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

/** Which edges a handle moves. */
const HANDLES = [
  { id: 'nw', x: 0,   y: 0,   cursor: 'nwse-resize' },
  { id: 'ne', x: 1,   y: 0,   cursor: 'nesw-resize' },
  { id: 'sw', x: 0,   y: 1,   cursor: 'nesw-resize' },
  { id: 'se', x: 1,   y: 1,   cursor: 'nwse-resize' },
];

export default function ImageCrop() {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);      // { width, height, url }
  const [crop, setCrop] = useState(null);        // in source pixels
  const [ratioId, setRatioId] = useState('free');
  const [formatId, setFormatId] = useState('jpeg');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const decodedRef = useRef(null);
  const frameRef = useRef(null);
  const dragRef = useRef(null);

  // Release the decoded bitmap only when the component goes away. Keying this
  // on `image` closed the bitmap that had just been created, because the ref
  // already pointed at the new one by the time the old cleanup ran — which
  // surfaced as "the image source is detached" on the first crop.
  useEffect(() => () => decodedRef.current?.release?.(), []);

  // Revoke the previous preview URL when it is replaced, capturing the value
  // this effect was given rather than reading the latest state.
  useEffect(() => {
    const url = image?.url;
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [image?.url]);

  const onFiles = useCallback(async ([f]) => {
    setError(''); setResult(null); setBusy(true);
    decodedRef.current?.release?.();
    try {
      const d = await decodeImage(f);
      decodedRef.current = d;
      const url = URL.createObjectURL(f);
      setImage({ width: d.width, height: d.height, url });
      setCrop(centredCrop(null, d.width, d.height));
      setRatioId('free');
      setFormatId(defaultFormatFor(f.type));
      setFile(f);
    } catch (e) {
      setError(e.message || 'That file could not be read as an image.');
      setFile(null); setImage(null);
    }
    setBusy(false);
  }, []);

  /** Displayed size of the image inside its frame, used to map pointer -> source px. */
  const scale = () => {
    const el = frameRef.current;
    if (!el || !image) return 1;
    return el.clientWidth / image.width;
  };

  const applyRatio = (id) => {
    setRatioId(id);
    const ratio = getAspectRatio(id).value;
    setCrop(c => applyAspectRatio(c, ratio, image.width, image.height));
  };

  /* ── Pointer handling ─────────────────────────────────────────────────
   * Pointer events rather than mouse events, so a finger drag on a phone
   * behaves exactly like a mouse drag. `setPointerCapture` keeps the drag
   * alive when the finger leaves the image.
   */
  const startDrag = (e, mode, handle) => {
    if (!image) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = {
      mode, handle,
      startX: e.clientX, startY: e.clientY,
      origin: { ...crop },
      s: scale(),
    };
  };

  const onDrag = (e) => {
    const d = dragRef.current;
    if (!d || !image) return;
    const dx = (e.clientX - d.startX) / d.s;
    const dy = (e.clientY - d.startY) / d.s;
    const ratio = getAspectRatio(ratioId).value;

    if (d.mode === 'move') {
      setCrop(clampCrop({ ...d.origin, x: d.origin.x + dx, y: d.origin.y + dy }, image.width, image.height));
      return;
    }

    // Resize from the grabbed corner; the opposite corner stays put.
    const o = d.origin;
    let { x, y, width, height } = o;
    const h = d.handle;
    if (h.x === 0) { x = o.x + dx; width = o.width - dx; } else { width = o.width + dx; }
    if (h.y === 0) { y = o.y + dy; height = o.height - dy; } else { height = o.height + dy; }
    if (width < 10) { width = 10; x = h.x === 0 ? o.x + o.width - 10 : o.x; }
    if (height < 10) { height = 10; y = h.y === 0 ? o.y + o.height - 10 : o.y; }

    const next = ratio
      ? applyAspectRatio({ x, y, width, height }, ratio, image.width, image.height)
      : clampCrop({ x, y, width, height }, image.width, image.height);
    setCrop(next);
  };

  const endDrag = (e) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  /** Nudge a single edge from the number inputs, keeping the crop legal. */
  const setCropField = (key) => (value) => {
    const ratio = getAspectRatio(ratioId).value;
    const next = { ...crop, [key]: Number(value) || 0 };
    setCrop(ratio && (key === 'width' || key === 'height')
      ? applyAspectRatio(next, ratio, image.width, image.height)
      : clampCrop(next, image.width, image.height));
  };

  const run = async () => {
    if (!decodedRef.current || !crop) return;
    const problem = cropProblem(crop, image.width, image.height);
    if (problem) { setError(problem); return; }
    setBusy(true); setError(''); setResult(null);
    try {
      const safe = clampCrop(crop, image.width, image.height);
      const out = await cropImage(decodedRef.current, safe, { formatId, quality: 0.92 });
      setResult({ ...out, url: URL.createObjectURL(out.blob) });
    } catch (e) {
      setError(e.message || 'The image could not be cropped.');
    }
    setBusy(false);
  };

  const reset = () => {
    decodedRef.current?.release?.();
    decodedRef.current = null;
    setFile(null); setImage(null); setCrop(null); setResult(null); setError('');
  };

  // Overlay geometry as percentages, so it tracks the image at any display size.
  const pct = crop && image ? {
    left:  `${(crop.x / image.width) * 100}%`,
    top:   `${(crop.y / image.height) * 100}%`,
    width: `${(crop.width / image.width) * 100}%`,
    height:`${(crop.height / image.height) * 100}%`,
  } : null;

  return (
    <ToolShell
      slug="image-crop"
      title="Crop Image"
      outcome="Trim an image to the part you actually want — freehand, or to a fixed shape like 1:1 or 16:9."
      content={content}
    >
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {!file && (
        <FileDropZone
          accept={ACCEPT} mimeTypes={MIME} maxMB={MAX_MB} onFiles={onFiles} onError={setError}
          label="Drop an image here or"
          hint={`JPG, PNG, WebP, GIF or BMP · max ${MAX_MB} MB`}
        />
      )}

      {file && image && crop && (
        <div className="space-y-5">
          <FileChip name={file.name} size={file.size} icon="🖼️" onRemove={reset} />

          <div className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card">
            <div
              ref={frameRef}
              className="relative select-none touch-none mx-auto"
              style={{ maxWidth: '100%' }}
              onPointerMove={onDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url} alt="Image being cropped"
                className="w-full block rounded-lg pointer-events-none"
                draggable={false}
              />
              {/* Dim everything outside the selection. */}
              <div className="absolute inset-0 bg-black/45 rounded-lg pointer-events-none" />
              <div
                className="absolute border-2 border-white cursor-move"
                style={pct}
                data-testid="crop-box"
                onPointerDown={e => startDrag(e, 'move')}
              >
                {/*
                  Punch the selection back out of the dimming layer by drawing
                  the image again, offset so the selected region lines up.
                  This needs its own overflow-hidden wrapper: the copy is larger
                  than the box by design, and without clipping it spills over the
                  dimmed area and the selection becomes invisible. The wrapper
                  cannot be the box itself, because the corner handles sit half
                  outside it and would be clipped too.
                */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img
                    src={image.url} alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="absolute max-w-none"
                    style={{
                      width: `${(image.width / crop.width) * 100}%`,
                      height: `${(image.height / crop.height) * 100}%`,
                      left: `${-(crop.x / crop.width) * 100}%`,
                      top: `${-(crop.y / crop.height) * 100}%`,
                    }}
                  />
                </div>
                {HANDLES.map(h => (
                  <span
                    key={h.id}
                    role="button"
                    aria-label={`Resize from ${h.id}`}
                    onPointerDown={e => startDrag(e, 'resize', h)}
                    data-testid={`handle-${h.id}`}
                    className="absolute w-5 h-5 bg-white border-2 border-brand-600 rounded-full -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%`, cursor: h.cursor, touchAction: 'none' }}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-ink-400 text-center mt-3">
              Drag inside the box to move it, or drag a corner to resize. {image.width} × {image.height} original.
            </p>
          </div>

          <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-card space-y-4" data-testid="crop-options">
            <SelectField
              id="cr-ratio" label="Shape" value={ratioId} onChange={applyRatio}
              options={ASPECT_RATIOS.map(r => ({ value: r.id, label: r.label }))}
              hint="Freeform lets you drag any rectangle. A fixed shape keeps the proportions while you resize."
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <NumberField id="cr-x" label="X" value={crop.x} onChange={setCropField('x')} />
              <NumberField id="cr-y" label="Y" value={crop.y} onChange={setCropField('y')} />
              <NumberField id="cr-w" label="Width" value={crop.width} onChange={setCropField('width')} />
              <NumberField id="cr-h" label="Height" value={crop.height} onChange={setCropField('height')} />
            </div>
            <SelectField
              id="cr-format" label="Output format" value={formatId} onChange={setFormatId}
              options={OUTPUT_FORMATS.map(f => ({ value: f.id, label: f.label }))}
              hint={formatId === 'png' ? 'PNG keeps transparency.' : 'Transparency is flattened onto white.'}
            />
            <p className="text-sm text-ink-600" data-testid="output-dims">
              Output: <span className="font-semibold text-ink-900">{clampCrop(crop, image.width, image.height).width} × {clampCrop(crop, image.width, image.height).height}</span> pixels
            </p>
            <button
              onClick={run} disabled={busy}
              className="w-full py-3.5 rounded-xl bg-ink-900 text-white font-semibold text-sm
                         hover:bg-ink-800 disabled:bg-ink-300 disabled:cursor-not-allowed transition-colors"
            >
              {busy ? 'Cropping…' : 'Crop image'}
            </button>
          </div>

          {result && (
            <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-card space-y-4" data-testid="crop-result">
              <p className="text-sm text-ink-600 text-center">
                Cropped to <span className="font-semibold text-ink-900" data-testid="result-dims">{result.width} × {result.height}</span>
                {' · '}{formatBytes(result.blob.size)}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.url} alt="Cropped result preview" className="w-full rounded-xl border border-ink-100" data-testid="result-preview" />
              <button
                onClick={() => downloadBlob(result.blob, retargetFilename(file.name, getFormat(formatId).ext, '-cropped'))}
                className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors"
              >
                Download cropped image
              </button>
              <p className="text-xs text-ink-400 text-center">Cropped in your browser. The image is never uploaded.</p>
            </div>
          )}
        </div>
      )}
    </ToolShell>
  );
}

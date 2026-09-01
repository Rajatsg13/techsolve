'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import ToolShell, { ErrorBanner } from '../components/tool-ui/ToolShell';
import FileDropZone, { FileChip } from '../components/tool-ui/FileDropZone';
import { SelectField, CheckField } from '../components/tool-ui/Field';
import { getToolContent } from '../content/tools';
import { decodeImage, encodeImage, compressToTarget } from '../lib/imageCanvas';
import { OUTPUT_FORMATS, defaultFormatFor, savingsPercent, retargetFilename, getFormat } from '../lib/image';
import { downloadBlob, formatBytes } from '../lib/download';

const content = getToolContent('image-compress');
const MAX_MB = 50;
const ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,.bmp';
const MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

const TARGETS = [
  { id: 'quality', label: 'Choose a quality level' },
  { id: 'size',    label: 'Aim for a file size' },
];
const SIZE_TARGETS = [100, 200, 500, 1024, 2048];

export default function ImageCompress() {
  const [file, setFile] = useState(null);
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const [mode, setMode] = useState('quality');
  const [quality, setQuality] = useState(75);
  const [targetKB, setTargetKB] = useState(500);
  const [formatId, setFormatId] = useState('jpeg');
  const [resize, setResize] = useState(false);
  const [maxDim, setMaxDim] = useState(1920);

  const decodedRef = useRef(null);
  useEffect(() => () => decodedRef.current?.release?.(), []);

  const onFiles = useCallback(async ([f]) => {
    setError(''); setResult(null); setBusy(true);
    decodedRef.current?.release?.();
    try {
      const d = await decodeImage(f);
      decodedRef.current = d;
      setDecoded({ width: d.width, height: d.height });
      setFile(f);
      setFormatId(defaultFormatFor(f.type));
    } catch (e) {
      setError(e.message || 'That file could not be read as an image.');
      setFile(null); setDecoded(null);
    }
    setBusy(false);
  }, []);

  const run = async () => {
    if (!decodedRef.current) return;
    setBusy(true); setError(''); setResult(null);
    try {
      const limits = resize ? { maxWidth: maxDim, maxHeight: maxDim } : {};
      const out = mode === 'size'
        ? await compressToTarget(decodedRef.current, targetKB * 1024, { formatId, ...limits })
        : { ...await encodeImage(decodedRef.current, { formatId, quality: quality / 100, ...limits }),
            quality: quality / 100, reachedTarget: true };
      setResult({
        blob: out.blob, width: out.width, height: out.height,
        quality: Math.round(out.quality * 100),
        reachedTarget: out.reachedTarget,
        url: URL.createObjectURL(out.blob),
      });
    } catch (e) {
      setError(e.message || 'The image could not be compressed.');
    }
    setBusy(false);
  };

  const reset = () => {
    decodedRef.current?.release?.();
    decodedRef.current = null;
    setFile(null); setDecoded(null); setResult(null); setError('');
  };

  const saved = result ? savingsPercent(file.size, result.blob.size) : null;

  return (
    <ToolShell
      slug="image-compress"
      title="Compress Image"
      outcome="Make a JPG, PNG or WebP smaller so it fits an upload limit or an email — without it turning to mush."
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

      {file && (
        <div className="space-y-5">
          <FileChip
            name={file.name} size={file.size} icon="🖼️" onRemove={reset}
          />
          {decoded && (
            <p className="text-xs text-ink-500 -mt-3">
              {decoded.width} × {decoded.height} pixels
            </p>
          )}

          <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-card space-y-4" data-testid="compress-options">
            <SelectField
              id="ic-mode" label="How should it be compressed?" value={mode} onChange={setMode}
              options={TARGETS.map(t => ({ value: t.id, label: t.label }))}
            />

            {mode === 'quality' ? (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="ic-quality" className="text-sm font-semibold text-ink-800">Quality</label>
                  <span className="text-xs font-bold text-brand-700" data-testid="quality-value">{quality}%</span>
                </div>
                <input
                  id="ic-quality" type="range" min="10" max="100" step="5" value={quality}
                  onChange={e => setQuality(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <p className="text-xs text-ink-400 mt-1">
                  75% is a good starting point for photos. Below about 50% the softening becomes visible.
                </p>
              </div>
            ) : (
              <SelectField
                id="ic-target" label="Target size" value={String(targetKB)} onChange={v => setTargetKB(Number(v))}
                options={SIZE_TARGETS.map(kb => ({
                  value: String(kb),
                  label: kb >= 1024 ? `${kb / 1024} MB or less` : `${kb} KB or less`,
                }))}
                hint="Quality is lowered step by step until the file fits. If it cannot get there, you are told."
              />
            )}

            <SelectField
              id="ic-format" label="Output format" value={formatId} onChange={setFormatId}
              options={OUTPUT_FORMATS.map(f => ({ value: f.id, label: f.label }))}
              hint={formatId === 'png'
                ? 'PNG keeps transparency but is lossless, so it will not shrink much. JPEG or WebP compress photographs far better.'
                : 'Transparency is flattened onto white. WebP is usually smallest; JPEG is the most widely accepted.'}
            />

            <CheckField
              id="ic-resize" label="Also reduce the dimensions" checked={resize} onChange={setResize}
              hint="Scaling down is usually what actually makes a photo small enough."
            />
            {resize && (
              <SelectField
                id="ic-maxdim" label="Longest side" value={String(maxDim)} onChange={v => setMaxDim(Number(v))}
                options={[800, 1280, 1600, 1920, 2560].map(d => ({ value: String(d), label: `${d} px` }))}
              />
            )}

            <button
              onClick={run} disabled={busy}
              className="w-full py-3.5 rounded-xl bg-ink-900 text-white font-semibold text-sm
                         hover:bg-ink-800 disabled:bg-ink-300 disabled:cursor-not-allowed transition-colors"
            >
              {busy ? 'Compressing…' : 'Compress image'}
            </button>
          </div>

          {result && (
            <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-card space-y-4" data-testid="compress-result">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-ink-500">Before</p>
                  <p className="font-semibold text-ink-900">{formatBytes(file.size)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">After</p>
                  <p className="font-semibold text-ink-900" data-testid="size-after">{formatBytes(result.blob.size)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Saved</p>
                  <p className={`font-bold ${saved > 0 ? 'text-green-600' : 'text-amber-600'}`} data-testid="saved-percent">
                    {saved > 0 ? `${saved}%` : 'nothing'}
                  </p>
                </div>
              </div>

              {saved <= 0 && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  This did not make the file smaller. The original is already well compressed — try a lower
                  quality, a smaller size, or WebP.
                </p>
              )}
              {mode === 'size' && !result.reachedTarget && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Could not reach {targetKB} KB even at the lowest quality. Reduce the dimensions as well,
                  or accept the size shown.
                </p>
              )}

              <p className="text-xs text-ink-500 text-center">
                {result.width} × {result.height} · {getFormat(formatId).label} · quality {result.quality}%
              </p>

              <img
                src={result.url} alt="Compressed result preview"
                className="w-full rounded-xl border border-ink-100"
                data-testid="result-preview"
              />

              <button
                onClick={() => downloadBlob(result.blob, retargetFilename(file.name, getFormat(formatId).ext, '-compressed'))}
                className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors"
              >
                Download compressed image
              </button>
              <p className="text-xs text-ink-400 text-center">
                Compressed in your browser. The image is never uploaded.
              </p>
            </div>
          )}
        </div>
      )}
    </ToolShell>
  );
}

'use client';
import { useState, useCallback, useRef } from 'react';
import ToolShell, { ToolNotice, ErrorBanner } from '../components/tool-ui/ToolShell';
import FileDropZone from '../components/tool-ui/FileDropZone';
import { SelectField } from '../components/tool-ui/Field';
import { getToolContent } from '../content/tools';
import { sniffHeic, decodeHeic } from '../lib/heic';
import { retargetFilename, getFormat } from '../lib/image';
import { downloadBlob, formatBytes } from '../lib/download';

const content = getToolContent('heic-to-jpg');
const MAX_MB = 50;
const MAX_FILES = 30;

const FORMATS = [
  { id: 'jpeg', label: 'JPEG (.jpg)' },
  { id: 'png',  label: 'PNG (.png)' },
  { id: 'webp', label: 'WebP (.webp)' },
];

export default function HeicToJpg() {
  const [items, setItems] = useState([]);   // { file, status, blob, url, width, height, error, decoder }
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [formatId, setFormatId] = useState('jpeg');
  const [quality, setQuality] = useState(90);
  const cancelled = useRef(false);

  const onFiles = useCallback(async (files) => {
    setError('');
    const room = MAX_FILES - items.length;
    if (room <= 0) { setError(`You can convert ${MAX_FILES} files at a time.`); return; }

    const accepted = [];
    for (const file of files.slice(0, room)) {
      // Extension is not proof: browsers often report no MIME type for HEIC, and
      // a file renamed to .jpg is still HEIC inside. Check the container.
      const { isHeic, brand } = await sniffHeic(file);
      if (!isHeic) {
        accepted.push({ file, status: 'error',
          error: brand ? `Not a HEIC image — the file is "${brand}".` : 'This is not a HEIC image.' });
        continue;
      }
      accepted.push({ file, status: 'pending' });
    }
    if (files.length > room) setError(`Only the first ${room} files were added — the limit is ${MAX_FILES}.`);
    setItems(prev => [...prev, ...accepted]);
  }, [items.length]);

  const convert = async () => {
    setBusy(true); setError(''); cancelled.current = false;
    const mime = getFormat(formatId).mime;

    for (let i = 0; i < items.length; i++) {
      if (cancelled.current) break;
      if (items[i].status !== 'pending') continue;
      setItems(prev => prev.map((it, k) => k === i ? { ...it, status: 'working' } : it));
      try {
        const out = await decodeHeic(items[i].file, { mime, quality: quality / 100 });
        setItems(prev => prev.map((it, k) => k === i ? {
          ...it, status: 'done', blob: out.blob, url: URL.createObjectURL(out.blob),
          width: out.width, height: out.height, decoder: out.decoder,
        } : it));
      } catch (e) {
        setItems(prev => prev.map((it, k) => k === i ? {
          ...it, status: 'error',
          error: e?.message || 'This file could not be converted. It may be damaged or use an unsupported HEIC variant.',
        } : it));
      }
    }
    setBusy(false);
  };

  const downloadAll = () => {
    // No zip dependency: the files are saved one at a time. Browsers may prompt
    // for permission on the first few — that is the trade-off for not shipping
    // an archiver for a job most people do with two or three photos.
    items.filter(i => i.status === 'done').forEach((it, n) => {
      setTimeout(() => downloadBlob(it.blob, retargetFilename(it.file.name, getFormat(formatId).ext)), n * 250);
    });
  };

  const reset = () => {
    cancelled.current = true;
    items.forEach(i => i.url && URL.revokeObjectURL(i.url));
    setItems([]); setError('');
  };

  const done = items.filter(i => i.status === 'done');
  const pending = items.filter(i => i.status === 'pending');

  return (
    <ToolShell
      slug="heic-to-jpg"
      title="HEIC to JPG"
      outcome="Turn iPhone HEIC photos into JPG, PNG or WebP that any device, form or website will accept."
      notice={
        <ToolNotice>
          Conversion happens on your device. Large photos take a few seconds each the first time, while the
          decoder loads.
        </ToolNotice>
      }
      content={content}
    >
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <FileDropZone
        accept=".heic,.heif" mimeTypes={[]} maxMB={MAX_MB} multiple onFiles={onFiles} onError={setError}
        label="Drop HEIC photos here or"
        hint={`HEIC or HEIF · up to ${MAX_FILES} files · max ${MAX_MB} MB each`}
      />

      {items.length > 0 && (
        <div className="space-y-5 mt-5">
          <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-card space-y-4" data-testid="heic-options">
            <SelectField
              id="hj-format" label="Convert to" value={formatId} onChange={setFormatId}
              options={FORMATS.map(f => ({ value: f.id, label: f.label }))}
              hint={formatId === 'png'
                ? 'PNG is lossless, so files are much larger than the HEIC original.'
                : 'JPG is accepted everywhere. WebP is smaller but a few older systems reject it.'}
            />
            {formatId !== 'png' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="hj-quality" className="text-sm font-semibold text-ink-800">Quality</label>
                  <span className="text-xs font-bold text-brand-700">{quality}%</span>
                </div>
                <input
                  id="hj-quality" type="range" min="40" max="100" step="5" value={quality}
                  onChange={e => setQuality(Number(e.target.value))} className="w-full accent-brand-600"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={convert} disabled={busy || !pending.length}
                className="flex-1 py-3.5 rounded-xl bg-ink-900 text-white font-semibold text-sm
                           hover:bg-ink-800 disabled:bg-ink-300 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? 'Converting…' : `Convert ${pending.length || ''} ${pending.length === 1 ? 'photo' : 'photos'}`.trim()}
              </button>
              <button onClick={reset} className="px-5 py-3.5 rounded-xl border border-ink-200 text-sm font-medium text-ink-700 hover:bg-ink-50">
                Clear
              </button>
            </div>
          </div>

          <ul className="space-y-3" data-testid="heic-list">
            {items.map((it, i) => (
              <li key={i} className="bg-white border border-ink-100 rounded-xl p-3 flex items-center gap-3">
                {it.url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={it.url} alt="" className="w-14 h-14 object-cover rounded-lg border border-ink-100" />
                  : <span className="w-14 h-14 rounded-lg bg-ink-50 grid place-items-center text-xl" aria-hidden="true">📷</span>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate">{it.file.name}</p>
                  <p className="text-xs text-ink-500">
                    {it.status === 'pending' && formatBytes(it.file.size)}
                    {it.status === 'working' && 'Converting…'}
                    {it.status === 'done' && `${it.width} × ${it.height} · ${formatBytes(it.blob.size)}`}
                    {it.status === 'error' && <span className="text-red-600">{it.error}</span>}
                  </p>
                </div>
                {it.status === 'done' && (
                  <button
                    onClick={() => downloadBlob(it.blob, retargetFilename(it.file.name, getFormat(formatId).ext))}
                    className="text-xs font-semibold text-brand-700 hover:text-brand-800 shrink-0"
                  >
                    Download
                  </button>
                )}
              </li>
            ))}
          </ul>

          {done.length > 1 && (
            <button
              onClick={downloadAll}
              className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors"
            >
              Download all {done.length} images
            </button>
          )}
          {done.length > 0 && (
            <p className="text-xs text-ink-400 text-center">
              Converted in your browser. Your photos are never uploaded.
            </p>
          )}
        </div>
      )}
    </ToolShell>
  );
}

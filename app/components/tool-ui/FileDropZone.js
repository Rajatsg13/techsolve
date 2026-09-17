'use client';
import { useRef, useState } from 'react';
import { formatBytes } from '../../lib/download';

/**
 * Shared upload control: click-to-browse plus drag-and-drop, with size and type
 * validation in one place.
 *
 * Every file tool used to re-implement this, which is why size limits used to be
 * inconsistent and several tools had none at all.
 *
 * @param {string}   accept      input accept attribute, e.g. ".pdf"
 * @param {string[]} mimeTypes   allowed MIME types; [] disables the check
 * @param {number}   maxMB       per-file cap
 * @param {boolean}  multiple
 * @param {Function} onFiles     (File[]) => void, only ever valid files
 * @param {Function} onError     (string) => void
 */
export default function FileDropZone({
  accept = '', mimeTypes = [], maxMB = 50, multiple = false,
  onFiles, onError, hint, label = 'Drop your file here or',
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const validate = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const ok = [];
    for (const f of files) {
      const typeOk = mimeTypes.length === 0 || mimeTypes.includes(f.type);
      // Some browsers report an empty MIME type for less common formats (HEIC is
      // the usual offender), so fall back to the file extension.
      const extOk = !accept || accept.split(',').some(e => f.name.toLowerCase().endsWith(e.trim().toLowerCase()));
      if (!typeOk && !extOk) { onError?.(`"${f.name}" is not a supported file type.`); continue; }
      if (f.size > maxMB * 1048576) {
        onError?.(`"${f.name}" is ${formatBytes(f.size)} — the limit is ${maxMB} MB.`); continue;
      }
      if (f.size === 0) { onError?.(`"${f.name}" is empty.`); continue; }
      ok.push(f);
    }
    if (ok.length) onFiles?.(multiple ? ok : [ok[0]]);
  };

  return (
    <div
      className={`drop-zone ${dragging ? 'active' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); validate(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
      role="button"
      tabIndex={0}
    >
      <div className="text-4xl mb-3" aria-hidden="true">📂</div>
      <p className="font-semibold text-ink-800">
        {label} <span className="text-brand-700 underline">browse</span>
      </p>
      <p className="text-xs text-ink-400 mt-1">{hint || `Max ${maxMB} MB`}</p>
      <input
        ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden"
        onChange={e => { validate(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}

/** Selected-file summary row with a remove control. */
export function FileChip({ name, size, onRemove, icon = '📄' }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-ink-200 rounded-xl px-4 py-3">
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-800 truncate">{name}</p>
        {size != null && <p className="text-xs text-ink-400">{formatBytes(size)}</p>}
      </div>
      {onRemove && (
        <button onClick={onRemove} className="text-xs text-red-500 font-medium hover:text-red-700">Remove</button>
      )}
    </div>
  );
}

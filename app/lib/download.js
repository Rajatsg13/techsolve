/**
 * Download helpers.
 *
 * Every file tool used to inline its own object-URL dance. This centralises it
 * and, importantly, revokes the object URL afterwards — the inline versions
 * leaked one blob URL per download for the lifetime of the tab.
 */

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Give the browser a beat to start the download before releasing the URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Download raw bytes with an explicit MIME type. */
export function downloadBytes(bytes, filename, mime = 'application/octet-stream') {
  downloadBlob(new Blob([bytes], { type: mime }), filename);
}

/** Download a string as a text file. */
export function downloadText(text, filename, mime = 'text/plain;charset=utf-8') {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

/**
 * Swap a file's extension: "report.pdf" -> "report.xlsx".
 * Falls back to appending when the name has no extension.
 */
export function withExtension(filename, ext) {
  const base = filename.replace(/\.[^./\\]+$/, '');
  return `${base}.${ext.replace(/^\./, '')}`;
}

/** Human-readable file size. */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

'use client';
import { useState, useCallback } from 'react';
import ToolShell, { ToolNotice, ErrorBanner } from '../components/tool-ui/ToolShell';
import FileDropZone, { FileChip } from '../components/tool-ui/FileDropZone';
import { CheckField } from '../components/tool-ui/Field';
import { getToolContent } from '../content/tools';
import { extractTables, mergeContinuations } from '../lib/pdfToTables';
import { buildXlsx } from '../lib/xlsx';
import { downloadBlob } from '../lib/download';

const content = getToolContent('pdf-to-excel');
const MAX_MB = 50;

export default function PdfToExcel() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);   // { tables, pagesWithText, pageCount }
  const [merge, setMerge] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const onFiles = useCallback(async ([f]) => {
    setError(''); setResult(null); setBusy(true); setProgress('');
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const out = await extractTables(bytes, {
        onProgress: (done, total) => setProgress(`Analysing page ${done} of ${total}…`),
      });
      setResult(out);
      setFile(f);
      setProgress('');
    } catch (e) {
      setError(e?.message || 'That PDF could not be read.');
      setFile(null); setResult(null);
    }
    setBusy(false);
  }, []);

  const sheets = () => {
    const source = merge ? mergeContinuations(result.tables) : result.tables.map(t => ({ ...t, pages: [t.page] }));
    return source.map((t, i) => ({
      name: t.pages.length > 1
        ? `Table ${i + 1} (p${t.pages[0]}-${t.pages[t.pages.length - 1]})`
        : `Table ${i + 1} (p${t.pages[0]})`,
      rows: t.rows,
    }));
  };

  const save = async () => {
    setBusy(true); setError('');
    try {
      const blob = await buildXlsx(sheets());
      downloadBlob(blob, file.name.replace(/\.pdf$/i, '') + '.xlsx');
    } catch (e) {
      setError(e?.message || 'The spreadsheet could not be created.');
    }
    setBusy(false);
  };

  const reset = () => { setFile(null); setResult(null); setError(''); };

  // No text at all means a scan; text but no grid means prose or a layout we
  // cannot read as a table. They need different advice, so they are told apart.
  const looksScanned = result && result.pagesWithText === 0;
  const preview = result && result.tables.length ? (merge ? mergeContinuations(result.tables) : result.tables.map(t => ({ ...t, pages: [t.page] }))) : [];

  return (
    <ToolShell
      slug="pdf-to-excel"
      title="PDF to Excel"
      outcome="Pull tables out of a digitally generated PDF into a real .xlsx workbook you can edit."
      notice={
        <ToolNotice>
          This reads the text layer a PDF carries, so it works on PDFs produced by software — exports,
          statements, reports. It cannot read <strong>scanned pages or tables saved as pictures</strong>,
          because there is no text in them to read.
        </ToolNotice>
      }
      content={content}
    >
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {!file && (
        <FileDropZone
          accept=".pdf" mimeTypes={['application/pdf']} maxMB={MAX_MB}
          onFiles={onFiles} onError={setError}
          label="Drop a PDF here or" hint={`PDF · max ${MAX_MB} MB · up to 100 pages`}
        />
      )}
      {busy && progress && <p className="text-sm text-ink-500 mt-4" data-testid="progress">{progress}</p>}

      {file && result && (
        <div className="space-y-5">
          <FileChip name={file.name} size={file.size} icon="📄" onRemove={reset} />

          {result.tables.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5" data-testid="no-tables">
              <p className="font-semibold text-amber-900 mb-1">No tables could be read from this PDF.</p>
              {looksScanned ? (
                <p className="text-sm text-amber-900">
                  This document has no text layer at all, which means it is a scan or a set of images. There
                  is nothing here to extract. Run it through <a href="/pdf-ocr" className="underline font-medium">OCR PDF</a> first
                  to add a text layer, then try again — bearing in mind that OCR output is a best guess, not
                  a faithful copy.
                </p>
              ) : (
                <p className="text-sm text-amber-900">
                  The document has text, but nothing in it is laid out as a grid this tool can read. That
                  usually means the content is prose, or a layout with no consistent columns. Nothing has
                  been guessed at, because a made-up table is worse than none.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-card space-y-4" data-testid="excel-options">
                <p className="text-sm text-ink-700" data-testid="table-summary">
                  Found <span className="font-semibold text-ink-900">{result.tables.length}</span>
                  {' '}table{result.tables.length > 1 ? 's' : ''} across {result.pageCount} page{result.pageCount > 1 ? 's' : ''}.
                  {merge && preview.length !== result.tables.length &&
                    ` Tables continuing across pages have been joined, giving ${preview.length} sheet${preview.length > 1 ? 's' : ''}.`}
                </p>
                <CheckField
                  id="xl-merge" label="Join tables that continue across pages" checked={merge} onChange={setMerge}
                  hint="Only joins tables on consecutive pages with the same number of columns. Unrelated tables always stay on their own sheets."
                />
              </div>

              <div className="space-y-4" data-testid="table-previews">
                {preview.map((t, i) => (
                  <div key={i} className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card">
                    <p className="text-xs font-semibold text-ink-600 mb-2">
                      Table {i + 1} · page{t.pages.length > 1 ? 's' : ''} {t.pages.join(', ')} · {t.rows.length} rows × {t.rows[0].length} columns
                    </p>
                    <div className="overflow-x-auto">
                      <table className="text-xs border-collapse min-w-full">
                        <tbody>
                          {t.rows.slice(0, 6).map((row, r) => (
                            <tr key={r} className={r === 0 ? 'font-semibold bg-ink-50' : ''}>
                              {row.map((cell, c) => (
                                <td key={c} className="border border-ink-100 px-2 py-1 whitespace-nowrap max-w-[220px] truncate">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {t.rows.length > 6 && (
                      <p className="text-xs text-ink-400 mt-2">…and {t.rows.length - 6} more rows</p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={save} disabled={busy}
                data-testid="save"
                className="w-full py-3.5 rounded-xl bg-ink-900 text-white font-semibold text-sm
                           hover:bg-ink-800 disabled:bg-ink-300 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? 'Building spreadsheet…' : `Download .xlsx (${preview.length} sheet${preview.length > 1 ? 's' : ''})`}
              </button>
              <p className="text-xs text-ink-400 text-center">
                Built in your browser. Your document is never uploaded.
              </p>
            </>
          )}
        </div>
      )}
    </ToolShell>
  );
}

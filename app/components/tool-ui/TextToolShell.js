'use client';
import { useState } from 'react';

/**
 * Shared input/output workbench for the Data & Text tools.
 *
 * All three (JSON, Base64, URL) are the same shape: paste text, press an
 * action, read the result or a precise error. This owns that layout, the copy
 * button, the character counts and the error presentation so the three pages
 * only contribute their actions and their transformation.
 */
export default function TextToolShell({
  inputLabel = 'Input',
  outputLabel = 'Output',
  placeholder,
  actions,
  controls,
  value,
  onChange,
  result,
  monoInput = true,
  inputRows = 12,
  footer,
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!result?.ok) return;
    try {
      await navigator.clipboard.writeText(result.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the textarea is selectable as a fallback */
    }
  };

  const mono = monoInput ? 'font-mono text-[13px]' : 'text-sm';

  return (
    <div className="space-y-4">
      {controls}

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label htmlFor="tt-input" className="text-sm font-semibold text-ink-800">{inputLabel}</label>
          <span className="text-xs text-ink-400 tabular-nums">
            {value.length.toLocaleString()} chars
          </span>
        </div>
        <textarea
          id="tt-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={inputRows}
          spellCheck={false}
          placeholder={placeholder}
          className={`w-full border border-ink-200 rounded-2xl px-3.5 py-3 bg-white resize-y
                      focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 ${mono}`}
        />
      </div>

      <div className="flex flex-wrap gap-2">{actions}</div>

      {result && !result.ok && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4" role="alert">
          <p className="text-sm font-semibold text-red-800">{result.error}</p>
          {result.snippet && (
            <pre className="mt-2 text-[12px] font-mono text-red-700 bg-red-100/60 rounded-lg px-3 py-2 overflow-x-auto">
              <code>{result.snippet}</code>
              {result.column ? <code className="block text-red-500">{' '.repeat(Math.max(0, result.column - 1))}^</code> : null}
            </pre>
          )}
        </div>
      )}

      {result?.ok && (
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label htmlFor="tt-output" className="text-sm font-semibold text-ink-800">{outputLabel}</label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-400 tabular-nums">{result.value.length.toLocaleString()} chars</span>
              <button
                type="button" onClick={copy}
                className="text-xs font-semibold text-brand-700 hover:text-brand-900"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            id="tt-output" readOnly value={result.value} rows={inputRows} spellCheck={false}
            className={`w-full border border-ink-200 rounded-2xl px-3.5 py-3 bg-ink-50/60 resize-y ${mono}`}
          />
          {footer}
        </div>
      )}
    </div>
  );
}

/** Primary / secondary action button used beneath the input. */
export function ToolButton({ children, onClick, variant = 'primary', disabled }) {
  const styles = variant === 'primary'
    ? 'bg-ink-900 text-white hover:bg-ink-800 disabled:bg-ink-300'
    : 'bg-white text-ink-700 border border-ink-200 hover:border-brand-300 hover:text-brand-700 disabled:opacity-50';
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${styles}`}>
      {children}
    </button>
  );
}

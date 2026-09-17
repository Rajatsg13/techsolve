'use client';

/**
 * Shared layout for the document generators: a form column, a sticky summary
 * with the download action, validation problems, and the unsupported-character
 * warning that all three need.
 */
export function GeneratorLayout({ form, summary }) {
  return (
    <div className="grid lg:grid-cols-[1.35fr_1fr] gap-6 items-start">
      <div className="space-y-5">{form}</div>
      <div className="lg:sticky lg:top-24 space-y-4">{summary}</div>
    </div>
  );
}

/** Titled group of fields. */
export function FormSection({ title, hint, children, columns = 2 }) {
  // A stable hook for tests: heading text alone is ambiguous once a section
  // contains repeated rows, and CSS classes are not a contract.
  const testId = 'section-' + String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return (
    <section data-testid={testId} className="bg-white border border-ink-100 rounded-2xl p-5 shadow-card">
      <h2 className="font-display text-sm font-bold text-ink-900">{title}</h2>
      {hint && <p className="text-xs text-ink-500 mt-0.5 mb-3">{hint}</p>}
      <div className={`grid gap-4 mt-3 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>{children}</div>
    </section>
  );
}

/** Multi-line address / notes field. */
export function AreaField({ id, label, value, onChange, placeholder, rows = 3, hint }) {
  return (
    <div className="sm:col-span-2">
      <label htmlFor={id} className="block text-sm font-semibold text-ink-800 mb-1.5">{label}</label>
      <textarea id={id} rows={rows} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-ink-200 rounded-xl px-3 py-2.5 text-sm bg-white resize-y
                   focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
      {hint && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
    </div>
  );
}

/** Problems that block generation. */
export function ProblemList({ problems }) {
  if (!problems.length) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4" role="alert">
      <p className="text-sm font-semibold text-amber-900 mb-1.5">
        {problems.length === 1 ? 'One thing to add' : `${problems.length} things to add`}
      </p>
      <ul className="space-y-1">
        {problems.map(p => (
          <li key={p} className="text-sm text-amber-800 flex gap-2">
            <span aria-hidden="true">·</span><span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Warning shown when the entered text contains characters the PDF font cannot
 * represent — Devanagari, Tamil, emoji. Better to say so than to silently drop
 * them from someone's invoice.
 */
export function CharacterWarning({ fields }) {
  if (!fields.length) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <p className="text-sm font-semibold text-amber-900 mb-1">Some characters cannot be printed</p>
      <p className="text-sm text-amber-800 leading-relaxed">
        {fields.join(', ')} {fields.length === 1 ? 'contains' : 'contain'} characters the PDF font does not
        support — non-Latin scripts such as Devanagari or Tamil, or emoji. They will be removed from the
        PDF. Use the Latin spelling to keep the document readable.
      </p>
    </div>
  );
}

/** Download button plus the headline total. */
export function GeneratePanel({ label, total, totalLabel, onGenerate, disabled, busy, note }) {
  return (
    <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-card">
      {total !== undefined && (
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-ink-500 font-semibold">{totalLabel}</p>
          <p className="font-display text-3xl font-extrabold text-ink-900 tabular-nums mt-1 break-words">{total}</p>
        </div>
      )}
      <button type="button" onClick={onGenerate} disabled={disabled || busy}
        className="w-full py-3.5 rounded-xl bg-ink-900 text-white font-semibold text-sm
                   hover:bg-ink-800 disabled:bg-ink-300 disabled:cursor-not-allowed transition-colors">
        {busy ? 'Generating…' : label}
      </button>
      {note && <p className="text-xs text-ink-400 mt-2.5 leading-relaxed">{note}</p>}
    </div>
  );
}

/** Add/remove row editor used for invoice line items and payslip components. */
export function RowEditor({ rows, onChange, columns, addLabel, minRows = 1 }) {
  const update = (i, key, value) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  const add = () => onChange([...rows, Object.fromEntries(columns.map(c => [c.key, '']))]);
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="sm:col-span-2 space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: columns.map(c => c.flex || '1fr').join(' ') }}>
            {columns.map(col => (
              <div key={col.key}>
                {i === 0 && <label htmlFor={`${col.key}-${i}`} className="block text-[11px] font-semibold text-ink-500 mb-1">{col.label}</label>}
                <input
                  id={`${col.key}-${i}`}
                  type={col.type || 'text'}
                  inputMode={col.type === 'number' ? 'decimal' : undefined}
                  value={row[col.key] ?? ''}
                  placeholder={col.placeholder}
                  onChange={e => update(i, col.key, e.target.value)}
                  aria-label={`${col.label} row ${i + 1}`}
                  className="w-full border border-ink-200 rounded-lg px-2.5 py-2 text-sm bg-white
                             focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
                />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => remove(i)} disabled={rows.length <= minRows}
            aria-label={`Remove row ${i + 1}`}
            className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center shrink-0
                        ${i === 0 ? 'mt-6' : ''} ${rows.length <= minRows
                          ? 'bg-ink-50 text-ink-300 cursor-not-allowed'
                          : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="text-sm font-semibold text-brand-700 hover:text-brand-900">+ {addLabel}</button>
    </div>
  );
}

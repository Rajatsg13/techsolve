'use client';

/**
 * Result presentation shared by the calculators.
 *
 * `ResultPanel` is the headline number; `ResultRows` are the supporting figures;
 * `FormulaNote` shows the arithmetic. Showing the formula is deliberate — these
 * are work tools, and someone pasting a number into a document usually needs to
 * be able to justify it.
 */

export function ResultPanel({ label, value, sub, tone = 'brand' }) {
  const tones = {
    brand: 'from-brand-600 to-brand-800',
    ink: 'from-ink-800 to-ink-950',
  };
  return (
    <div className={`bg-gradient-to-br ${tones[tone]} text-white rounded-2xl p-6`}>
      <p className="text-xs uppercase tracking-wide text-white/70 font-semibold">{label}</p>
      <p className="font-display text-3xl md:text-4xl font-extrabold mt-1 tabular-nums break-words">{value}</p>
      {sub && <p className="text-sm text-white/80 mt-2 leading-relaxed">{sub}</p>}
    </div>
  );
}

export function ResultRows({ rows }) {
  const visible = rows.filter(Boolean);
  if (!visible.length) return null;
  return (
    <dl className="divide-y divide-ink-100 border border-ink-100 rounded-2xl bg-white overflow-hidden">
      {visible.map(({ label, value, hint, strong }) => (
        <div key={label} className="flex items-baseline justify-between gap-4 px-4 py-3">
          <dt className={`text-sm ${strong ? 'font-semibold text-ink-900' : 'text-ink-600'}`}>
            {label}
            {hint && <span className="block text-xs text-ink-400 font-normal mt-0.5">{hint}</span>}
          </dt>
          <dd className={`text-sm tabular-nums whitespace-nowrap ${strong ? 'font-bold text-ink-900' : 'font-medium text-ink-800'}`}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function FormulaNote({ children }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-ink-50/60 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500 mb-1">How this is calculated</p>
      <p className="text-sm text-ink-700 leading-relaxed">{children}</p>
    </div>
  );
}

/** Two-column calculator layout: inputs left, results right (stacked on mobile). */
export function CalculatorLayout({ inputs, results }) {
  return (
    <div className="grid md:grid-cols-2 gap-5 items-start">
      <div className="space-y-4 bg-white border border-ink-100 rounded-2xl p-5 shadow-card">{inputs}</div>
      <div className="space-y-4">{results}</div>
    </div>
  );
}

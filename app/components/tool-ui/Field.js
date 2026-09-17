'use client';

/**
 * Form controls shared by the eight Business & Work calculators.
 * Every control pairs a real <label htmlFor> with its input — sibling-only
 * labels are not announced by screen readers and break getByLabel in tests.
 */

export function NumberField({ id, label, value, onChange, prefix, suffix, hint, min, max, step = 'any', placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink-800 mb-1.5">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-sm text-ink-500 pointer-events-none">{prefix}</span>}
        <input
          id={id} type="number" inputMode="decimal" value={value} min={min} max={max} step={step}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className={`w-full border border-ink-200 rounded-xl py-2.5 text-sm bg-white
                      focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400
                      ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-9' : 'pr-3'}`}
        />
        {suffix && <span className="absolute right-3 text-sm text-ink-500 pointer-events-none">{suffix}</span>}
      </div>
      {hint && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
    </div>
  );
}

export function TextField({ id, label, value, onChange, placeholder, hint, type = 'text' }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink-800 mb-1.5">{label}</label>
      <input
        id={id} type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-ink-200 rounded-xl px-3 py-2.5 text-sm bg-white
                   focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
      />
      {hint && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
    </div>
  );
}

export function SelectField({ id, label, value, onChange, options, hint }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink-800 mb-1.5">{label}</label>
      <select
        id={id} value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-ink-200 rounded-xl px-3 py-2.5 text-sm bg-white
                   focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
    </div>
  );
}

export function CheckField({ id, label, checked, onChange, hint }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2.5 text-sm font-medium text-ink-800 cursor-pointer">
        <input
          id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
        />
        {label}
      </label>
      {hint && <p className="text-xs text-ink-400 mt-1 ml-6">{hint}</p>}
    </div>
  );
}

/** Segmented control for two or three mutually exclusive modes. */
export function ModeTabs({ value, onChange, options, label }) {
  return (
    <div role="group" aria-label={label}>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
        {options.map(o => (
          <button
            key={o.value} type="button" onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
              value === o.value
                ? 'border-brand-600 bg-brand-50 text-brand-800'
                : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

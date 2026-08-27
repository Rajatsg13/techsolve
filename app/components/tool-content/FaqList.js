/**
 * FAQ accordion.
 *
 * Reuses the existing `.faq-item` styles from app/globals.css (which supply the
 * +/− marker via ::after), so this matches the accordions already on every
 * other tool page.
 */
export default function FaqList({ faqs }) {
  if (!faqs?.length) return null;
  return (
    <div className="space-y-3">
      {faqs.map(({ q, a }) => (
        <details key={q} className="faq-item bg-white border border-slate-100 rounded-xl overflow-hidden">
          <summary className="px-5 py-4 font-semibold text-slate-700 text-sm flex justify-between items-center gap-3">
            <span>{q}</span>
            <span className="text-brand-600 text-lg faq-icon flex-shrink-0" aria-hidden="true"></span>
          </summary>
          <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{a}</div>
        </details>
      ))}
    </div>
  );
}

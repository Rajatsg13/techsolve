/**
 * Shared wrapper for a rich-content section: consistent heading and spacing.
 * Renders nothing when it has no children, so callers can pass conditional
 * content without guarding every call site.
 */
export default function Section({ title, children, className = '' }) {
  if (!children) return null;
  return (
    <section className={`mt-10 ${className}`}>
      {title && (
        <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
      )}
      {children}
    </section>
  );
}

/**
 * The {title, body} pair used by whenToUse / workplaceUses / tips.
 * A plain definition list rather than cards — it reads as documentation
 * rather than as marketing tiles.
 */
export function ItemList({ items, columns = false }) {
  if (!items?.length) return null;
  return (
    <dl className={columns ? 'grid gap-x-8 gap-y-5 sm:grid-cols-2' : 'space-y-5'}>
      {items.map(item => (
        <div key={item.title}>
          <dt className="text-sm font-semibold text-slate-800">{item.title}</dt>
          <dd className="text-sm text-slate-600 leading-relaxed mt-1">{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}

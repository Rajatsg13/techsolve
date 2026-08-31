import ToolContent from '../tool-content/ToolContent';
import CrossBrandCard from '../CrossBrandCard';

/**
 * Standard tool page frame: heading, one-line outcome, the tool itself, then
 * whatever rich content exists for the slug.
 *
 * The interface always sits above the content — a visitor must never scroll
 * past an article to reach the tool.
 */
export default function ToolShell({ title, outcome, notice, content, slug, children }) {
  return (
    <div className="tool-container">
      <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900 mb-1">{title}</h1>
      {outcome && <p className="text-ink-600 mb-4 text-[15px] leading-relaxed max-w-2xl">{outcome}</p>}
      {notice}
      <div className="mt-6">{children}</div>
      <CrossBrandCard pageSlug={slug} />
      <ToolContent content={content} />
    </div>
  );
}

/** Amber caveat strip for limitations a user should know before they start. */
export function ToolNotice({ children }) {
  return (
    <div className="mt-3 inline-flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-3 py-2 max-w-2xl leading-relaxed">
      <span aria-hidden="true">⚠️</span>
      <span>{children}</span>
    </div>
  );
}

/** Red error banner. */
export function ErrorBanner({ children }) {
  if (!children) return null;
  return (
    <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700" role="alert">
      {children}
    </div>
  );
}

import Link from 'next/link';
import { getToolBySlug } from '../../lib/tools';

/**
 * Related tools, resolved from the central registry.
 *
 * Content files list slugs only — names, routes, icons and descriptions all
 * come from app/lib/tools.js, so renaming a tool in one place updates every
 * cross-reference. An unknown slug is skipped rather than rendering a dead
 * link, which keeps a typo from shipping a 404.
 */
export default function RelatedTools({ slugs, currentSlug }) {
  const tools = (slugs || [])
    .filter(slug => slug !== currentSlug)
    .map(getToolBySlug)
    .filter(Boolean);

  if (!tools.length) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {tools.map(tool => (
        <li key={tool.slug}>
          <Link
            href={tool.href}
            className="group flex items-start gap-3 h-full bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-brand-300 hover:bg-brand-50/40 transition-colors"
          >
            <span className="text-xl leading-none mt-0.5" aria-hidden="true">{tool.icon}</span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition-colors">
                {tool.name}
              </span>
              <span className="block text-xs text-slate-500 leading-relaxed mt-0.5">
                {tool.shortDescription}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

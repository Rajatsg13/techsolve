/**
 * CrossBrandCard
 *
 * Renders a muted contextual recommendation card for one of the partner brands.
 * Returns null if:
 *  - pageSlug is not in PAGE_BRAND_MAP
 *  - the mapped brand has active: false (dormant mode)
 *
 * Position: below the tool result panel, above the FAQ section.
 * Rules: no animation, no button, no popups. Static, quiet, dismissible.
 */

import Link from 'next/link';
import { BRANDS, PAGE_BRAND_MAP } from '../lib/crossBrandConfig';

function BrandIcon({ iconKey, colorClass }) {
  const base = `w-5 h-5 shrink-0 ${colorClass}`;
  if (iconKey === 'briefcase') return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={base} aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  );
  if (iconKey === 'palette') return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={base} aria-hidden="true">
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/>
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/>
      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  );
  if (iconKey === 'sparkle') return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={base} aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
      <path d="M19 3v4"/>
      <path d="M21 5h-4"/>
    </svg>
  );
  return null;
}

export default function CrossBrandCard({ pageSlug }) {
  const brandKey = PAGE_BRAND_MAP[pageSlug];
  if (!brandKey) return null;

  const brand = BRANDS[brandKey];
  if (!brand || !brand.active) return null;

  return (
    <div className="mt-8 mb-2">
      <p className="text-xs text-slate-400 mb-1.5 uppercase tracking-wide font-medium">
        From the TechSolve44 family
      </p>
      <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <div className="mt-0.5 shrink-0">
          <BrandIcon iconKey={brand.iconKey} colorClass={brand.iconColor} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-600 leading-snug">
            {brand.tagline}
          </p>
          <Link
            href={brand.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-1 text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors"
          >
            {brand.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}

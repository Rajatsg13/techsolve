import Link from 'next/link';
import { changelog } from '../lib/changelog';

export const metadata = {
  alternates: { canonical: '/changelog/' },
  // Root layout applies the '%s | TechSolve44' template — do not append the
  // suffix here too. (about/contact/privacy/terms do append it and end up with
  // a doubled "TechSolve44 | TechSolve44" in the rendered <title>; pre-existing,
  // left alone here since fixing it is out of scope for this page.)
  title: "What's New — Changelog",
  description: 'New tools, updates, and fixes on TechSolve44 — including changes made from user feedback.',
};

const TAG_STYLES = {
  New: 'bg-green-100 text-green-700',
  Update: 'bg-blue-50 text-blue-700',
};

export default function ChangelogPage() {
  const entries = [...changelog].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">What&rsquo;s new</h1>
      <p className="text-slate-500 mb-8">New tools, updates, and fixes — including ones you asked for.</p>

      <div className="space-y-4">
        {entries.map((entry) => (
          <article key={entry.date + entry.title} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-slate-400">{entry.displayDate}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TAG_STYLES[entry.tag] || TAG_STYLES.Update}`}>
                {entry.tag}
              </span>
            </div>

            <h2 className="text-[15px] font-bold text-slate-800">{entry.title}</h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{entry.description}</p>

            {entry.quote && (
              <blockquote className="mt-3 text-sm italic text-slate-500 border-l-2 border-slate-200 pl-3">
                &ldquo;{entry.quote}&rdquo;
              </blockquote>
            )}

            {entry.link && (
              <Link href={entry.link} className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors">
                Try it
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

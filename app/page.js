import Link from 'next/link';
import ToolCard from './components/ToolCard';
import { getActiveTools, getHomepageSections } from './lib/tools';

export const metadata = {
  alternates: { canonical: '/' },
  title: 'Tools by Decyfy — Free Online Tools for Everyday Work',
  description:
    'Free browser-based tools for everyday document and file work — merge, split, compress and convert PDFs, run OCR, resize images. No sign-up, and your files never leave your device.',
};

const toolCount = getActiveTools().length;

/* Everyday tasks, written as the job rather than the feature. Each points at
 * the tool that actually does it, so this section is navigation as well as copy. */
const everydayTasks = [
  { task: 'Send one file instead of six attachments',        href: '/pdf-merge',       tool: 'Merge PDF' },
  { task: 'Pull a few pages out of a long report',            href: '/pdf-split',       tool: 'Split PDF' },
  { task: 'Get a PDF under an upload size limit',             href: '/pdf-compress',    tool: 'Compress PDF' },
  { task: 'Edit text that only exists as a PDF',              href: '/pdf-to-word',     tool: 'PDF to Word' },
  { task: 'Search a scanned document you cannot select',      href: '/pdf-ocr',         tool: 'OCR PDF' },
  { task: 'Turn phone photos of paperwork into one document', href: '/image-to-pdf',    tool: 'Image to PDF' },
];

export default function HomePage() {
  const sections = getHomepageSections();

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-ink-100">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 0%, #eef4ff 0, transparent 45%), radial-gradient(circle at 88% 12%, #f3eefc 0, transparent 40%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-14 md:pt-24 md:pb-20">
          <p className="section-eyebrow mb-4">Tools by Decyfy</p>
          <h1 className="font-display text-4xl md:text-[3.25rem] md:leading-[1.06] font-extrabold text-ink-900 max-w-3xl text-balance">
            The small document jobs that fill your day, done in a few clicks.
          </h1>
          <p className="mt-5 text-lg text-ink-600 leading-relaxed max-w-2xl">
            Merge a set of PDFs, pull out the pages you need, get a file under an upload
            limit, or turn a scan into something you can actually search. {toolCount} focused
            tools that open, work, and get out of the way.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#tools"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-ink-900 text-white font-semibold text-sm hover:bg-ink-800 transition-colors shadow-card"
            >
              Browse all {toolCount} tools
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Link>
            <Link
              href="/pdf-merge"
              className="inline-flex items-center px-5 py-3 rounded-xl bg-white border border-ink-200 text-ink-800 font-semibold text-sm hover:border-brand-300 hover:text-brand-700 transition-colors"
            >
              Try Merge PDF
            </Link>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-7 gap-y-2 text-sm text-ink-500">
            {['No account needed', 'Files never leave your device', 'Free to use'].map(item => (
              <li key={item} className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-data" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── What this is ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-4">
        <div className="grid md:grid-cols-[1.15fr_1fr] gap-10 md:gap-14">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-4">
              Built for the paperwork around the actual work
            </h2>
            <div className="space-y-4 text-[15px] text-ink-600 leading-relaxed">
              <p>
                Most document problems are not complicated, they are just in the way. A form
                needs to go as one file. A report is thirty pages and you need four. A portal
                refuses anything over 5 MB. None of that is worth installing software for, and
                none of it should require an account.
              </p>
              <p>
                Tools by Decyfy is a set of single-purpose tools for exactly those moments —
                built for office staff, freelancers, small business owners, students and anyone
                who handles documents as part of getting something else done.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
            <h3 className="font-display text-base font-bold text-ink-900 mb-2">
              Why everything runs in your browser
            </h3>
            <p className="text-sm text-ink-600 leading-relaxed">
              These tools do their work on your own device rather than uploading your file to a
              server. That has three practical consequences:
            </p>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              {[
                ['Your documents stay yours.', 'Nothing is transmitted, so there is no copy of your file sitting on someone else’s machine.'],
                ['There is no upload wait.', 'Work starts immediately instead of after a file finishes crossing the network.'],
                ['It works on a bad connection.', 'Once the page has loaded, most tools keep working even if the network drops.'],
              ].map(([bold, rest]) => (
                <li key={bold} className="flex gap-2.5">
                  <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" aria-hidden="true" />
                  <span><span className="font-semibold text-ink-900">{bold}</span> {rest}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Everyday tasks ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pt-14">
        <h2 className="font-display text-2xl font-bold text-ink-900 mb-1">Common jobs</h2>
        <p className="text-[15px] text-ink-600 mb-6">
          If you arrived with one of these in mind, start here.
        </p>
        <ul className="grid sm:grid-cols-2 gap-2.5">
          {everydayTasks.map(({ task, href, tool }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white px-5 py-4 hover:border-brand-300 hover:shadow-card transition-all"
              >
                <span className="text-[15px] text-ink-800 leading-snug">{task}</span>
                <span className="shrink-0 text-xs font-semibold text-brand-600 group-hover:text-brand-800 whitespace-nowrap">
                  {tool} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── The catalogue ────────────────────────────────────── */}
      <section id="tools" className="max-w-7xl mx-auto px-4 pt-16 scroll-mt-20">
        <h2 className="font-display text-2xl font-bold text-ink-900 mb-1">All tools</h2>
        <p className="text-[15px] text-ink-600 mb-8">
          {toolCount} tools, grouped by what you are starting with.
        </p>

        {sections.map(section => (
          <div key={section.id} className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-xl ${section.homeIconBg} flex items-center justify-center text-lg`} aria-hidden="true">
                {section.homeIcon}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ink-900">{section.name}</h3>
                <p className="text-sm text-ink-500">{section.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {section.tools.map(t => (
                <ToolCard
                  key={t.href}
                  icon={t.icon}
                  title={t.name}
                  description={t.shortDescription}
                  href={t.href}
                  badge={t.badge}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── How people use them ──────────────────────────────── */}
      <section className="bg-white border-y border-ink-100 py-16 mt-4">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-ink-900 mb-2">How these get used</h2>
          <p className="text-[15px] text-ink-600 mb-9 max-w-2xl">
            The tools are small on purpose. Most real tasks use two or three of them in sequence.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                accent: 'bg-doc-soft text-doc',
                title: 'Submitting an application',
                body: 'Combine the form and its supporting documents in the order the checklist asks for, drop any duplicate pages, and compress once at the end if the portal has a size limit.',
                steps: ['Merge PDF', 'Organize Pages', 'Compress PDF'],
              },
              {
                accent: 'bg-img-soft text-img',
                title: 'Dealing with a scan',
                body: 'Scanners produce one file per batch. Join the batches back into a single document, then run OCR so the text can be searched and copied instead of just looked at.',
                steps: ['Merge PDF', 'OCR PDF'],
              },
              {
                accent: 'bg-data-soft text-data',
                title: 'Sharing a section of a report',
                body: 'Pull out only the pages that matter, add a watermark if it is a draft, and send that instead of a hundred-page file the recipient has to navigate.',
                steps: ['Split PDF', 'Watermark PDF'],
              },
            ].map(card => (
              <div key={card.title} className="rounded-3xl border border-ink-100 p-6">
                <div className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-3 ${card.accent}`}>
                  Workflow
                </div>
                <h3 className="font-display text-base font-bold text-ink-900 mb-2">{card.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{card.body}</p>
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {card.steps.map((step, i) => (
                    <span key={step} className="inline-flex items-center gap-1.5">
                      {i > 0 && <span className="text-ink-300 text-xs" aria-hidden="true">→</span>}
                      <span className="text-xs font-semibold text-ink-700 bg-ink-50 rounded-md px-2 py-1">{step}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">
          Nothing to install, nothing to sign up for
        </h2>
        <p className="text-[15px] text-ink-600 max-w-xl mx-auto leading-relaxed mb-7">
          Every tool opens straight to the thing it does. Pick one, do the job, close the tab.
        </p>
        <Link
          href="#tools"
          className="inline-flex items-center px-5 py-3 rounded-xl bg-ink-900 text-white font-semibold text-sm hover:bg-ink-800 transition-colors"
        >
          Browse all {toolCount} tools
        </Link>
      </section>
    </div>
  );
}

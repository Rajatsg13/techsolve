import Link from 'next/link';
import { toolMetadata } from '../lib/toolMeta';
import { getActiveTools, getHomepageSections } from '../lib/tools';

export const metadata = toolMetadata('/about/', {
  title: 'About',
  description:
    'Tools by Decyfy is a set of focused, browser-based tools for everyday document and file work. No accounts, no uploads, no clutter.',
});

const toolCount = getActiveTools().length;

export default function AboutPage() {
  const sections = getHomepageSections();

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <p className="section-eyebrow mb-3">About</p>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-ink-900 mb-4 text-balance">
        Small tools for the document work nobody plans for
      </h1>
      <p className="text-lg text-ink-600 leading-relaxed mb-10">
        Tools by Decyfy is a collection of {toolCount} single-purpose tools for the file and
        document tasks that come up in the middle of doing something else.
      </p>

      <div className="space-y-10 text-[15px] text-ink-700 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-bold text-ink-900 mb-3">Why it exists</h2>
          <p className="mb-3">
            A form has to be submitted as one file. A report is long and only four pages are
            relevant. An upload box rejects anything over a few megabytes. A scanned contract
            cannot be searched because it is really just a picture of text.
          </p>
          <p>
            These are not hard problems, but the usual answers are out of proportion to them —
            install a desktop suite, start a trial, create an account, or upload a document you
            would rather not hand over. Each tool here does one of those jobs and nothing else.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink-900 mb-3">Who it is for</h2>
          <p>
            Office and admin staff, freelancers and consultants, small business owners, students,
            and anyone who handles documents regularly without wanting to think about document
            software. No particular technical background is assumed — if you can open a file,
            you can use these.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink-900 mb-3">How the tools work</h2>
          <p className="mb-3">
            The work happens on your own device, in your browser. Your file is not uploaded to a
            server, which means it is not transmitted anywhere, there is no upload wait before
            work can start, and most tools keep working if your connection drops after the page
            has loaded.
          </p>
          <p>
            A few tools do fetch a processing engine or reference data from the internet the
            first time you use them — OCR needs its language data, for example. Even then it is
            the engine that travels to your device, not your document.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink-900 mb-3">What is here today</h2>
          <ul className="space-y-3">
            {sections.map(section => (
              <li key={section.id} className="flex gap-3">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-ink-900">{section.name}</span>
                  {' — '}{section.description.replace(/\.$/, '')}{' '}
                  <span className="text-ink-500">({section.tools.length} tools)</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            The set grows when there is a job worth adding a tool for, not to make the list
            longer. What ships is listed on the{' '}
            <Link href="/changelog" className="text-brand-700 font-medium hover:underline">
              what’s new
            </Link>{' '}
            page.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink-900 mb-3">Cost</h2>
          <p>
            The tools are free to use and do not require an account. The site carries advertising
            to cover its running costs.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink-900 mb-3">Get in touch</h2>
          <p>
            If a tool behaves oddly, or the thing you needed to do is not here, we would rather
            know.{' '}
            <Link href="/contact" className="text-brand-700 font-medium hover:underline">
              Contact us
            </Link>
            . Tools by Decyfy is operated by GDB Advisories LLP.
          </p>
        </section>
      </div>
    </div>
  );
}

import Link from 'next/link';
import Logo from './Logo';
import { getHomepageSections } from '../lib/tools';

/**
 * Footer.
 *
 * Tool columns are generated from the central registry, so the footer can no
 * longer drift from the catalogue — and, because the registry selectors exclude
 * legacy finance tools by default, it cannot surface a tool that is not part of
 * the public product. It previously carried a hand-written list.
 */
export default function Footer() {
  const sections = getHomepageSections();

  return (
    <footer className="bg-ink-950 text-ink-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Logo tone="footer" className="mb-4" />
          <p className="text-sm text-ink-400 leading-relaxed max-w-xs">
            Practical browser-based tools for everyday document and file work.
            No sign-up, and your files never leave your device.
          </p>
        </div>

        {sections.map(section => (
          <div key={section.id}>
            <h2 className="font-display font-bold text-white mb-3 text-xs uppercase tracking-[0.12em]">
              {section.name}
            </h2>
            <ul className="space-y-2 text-sm">
              {section.tools.map(tool => (
                <li key={tool.slug}>
                  <Link href={tool.href} className="text-ink-400 hover:text-white transition-colors">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="font-display font-bold text-white mb-3 text-xs uppercase tracking-[0.12em]">Company</h2>
          <ul className="space-y-2 text-sm">
            {[
              ['About', '/about'],
              ['What’s new', '/changelog'],
              ['Contact', '/contact'],
              ['Privacy Policy', '/privacy-policy'],
              ['Terms of Service', '/terms-of-service'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-ink-400 hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-xs text-ink-500 leading-relaxed">
            © {new Date().getFullYear()} Tools by Decyfy, a division of GDB Advisories LLP.
            All tools are free and run locally in your browser.
          </p>
        </div>
      </div>
    </footer>
  );
}

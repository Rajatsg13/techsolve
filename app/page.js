import ToolCard from './components/ToolCard';
import { getHomepageSections } from './lib/tools';

export const metadata = {
  alternates: { canonical: '/' },
  title: 'TechSolve44 — Free Online Tools: PDF, Calculators, Image Tools',
  description: 'Free online PDF tools, EMI calculator, SIP calculator, image resizer and more. No signup. No download. Works in your browser.',
};

const stats = [
  { value: '25+', label: 'Free Tools' },
  { value: '0',   label: 'Signup Required' },
  { value: '100%', label: 'Browser-Based' },
  { value: '∞',   label: 'Free Forever' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Free · No Login · No Data Stored
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            All the Online Tools<br />
            <span className="text-brand-300">You Actually Need</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto mb-8">
            PDF converters, financial calculators, image tools and more — all free, all browser-based. No downloads, no account.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 mt-6">
      </div>

      {getHomepageSections().map((section, i) => (
        <section key={section.id} className={`max-w-7xl mx-auto px-4 ${i === 0 ? 'pt-12' : 'pt-10'} pb-4`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-lg ${section.homeIconBg} flex items-center justify-center text-lg`}>{section.homeIcon}</div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{section.homeTitle}</h2>
              <p className="text-sm text-slate-500">{section.homeSubtitle}</p>
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
        </section>
      ))}

      <div className="max-w-4xl mx-auto px-4 mt-8 mb-4">
      </div>

      <section className="bg-white border-y border-slate-100 py-12 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Why TechSolve44?</h2>
          <p className="text-slate-500 mb-10">We built the tools we always wished existed — simple, fast and free.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'Instant Results', desc: 'Everything runs in your browser. No waiting for server uploads.' },
              { icon: '🔒', title: 'Private & Secure', desc: "Your files never leave your device. We don't store anything." },
              { icon: '📱', title: 'Works Everywhere', desc: 'Fully responsive — use on mobile, tablet or desktop.' },
            ].map(f => (
              <div key={f.title} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-50">
                <div className="text-4xl">{f.icon}</div>
                <h3 className="font-semibold text-slate-800">{f.title}</h3>
                <p className="text-sm text-slate-500 text-center">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-8" />
    </div>
  );
}

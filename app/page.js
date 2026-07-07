import ToolCard from './components/ToolCard';

export const metadata = {
  alternates: { canonical: '/' },
  title: 'TechSolve44 — Free Online Tools: PDF, Calculators, Image Tools',
  description: 'Free online PDF tools, EMI calculator, SIP calculator, image resizer and more. No signup. No download. Works in your browser.',
};

const pdfTools = [
  { icon: '📄', title: 'PDF to Word',      description: 'Convert PDF files to editable Word documents instantly.', href: '/pdf-to-word', badge: 'Popular' },
  { icon: '🖼️', title: 'PDF to JPG',       description: 'Convert each PDF page to a high-quality JPG image.', href: '/pdf-to-jpg' },
  { icon: '🔗', title: 'Merge PDF',         description: 'Combine multiple PDF files into a single document.', href: '/pdf-merge' },
  { icon: '✂️', title: 'Split PDF',         description: 'Split a PDF into pages or custom page ranges.', href: '/pdf-split' },
  { icon: '📑', title: 'Organize Pages',    description: 'Reorder and delete pages in your PDF.', href: '/pdf-organize' },
  { icon: '🗜️', title: 'Compress PDF',     description: 'Reduce PDF file size without losing quality.', href: '/pdf-compress' },
  { icon: '📝', title: 'Word to PDF',       description: 'Convert Word (.docx) files to PDF format online.', href: '/word-to-pdf' },
  { icon: '💧', title: 'Watermark PDF',     description: 'Add a custom text watermark to every page.', href: '/pdf-watermark' },
  { icon: '🔢', title: 'Add Page Numbers',  description: 'Number every page of your PDF automatically.', href: '/pdf-page-numbers' },
  { icon: '🌐', title: 'HTML to PDF',       description: 'Convert any HTML content to a PDF file.', href: '/html-to-pdf', badge: 'New' },
  { icon: '🔍', title: 'OCR PDF',           description: 'Extract text from scanned PDFs using OCR.', href: '/pdf-ocr', badge: 'New' },
  { icon: '🔓', title: 'Remove PDF Password', description: 'Remove owner or user password protection from any PDF.', href: '/pdf-unlock', badge: 'New' },
];

const imageTools = [
  { icon: '🖼️', title: 'Image to PDF',  description: 'Convert JPG, PNG images into a PDF file easily.', href: '/image-to-pdf', badge: 'Popular' },
  { icon: '📐', title: 'Image Resizer', description: 'Resize JPG, PNG or WebP to any size. Change format & quality.', href: '/image-resize' },
  { icon: '📷', title: 'Scan to PDF',   description: 'Use your phone camera to scan documents to PDF.', href: '/scan-to-pdf' },
];

const calculators = [
  { icon: '🏠', title: 'EMI Calculator',             description: 'Calculate EMI for home, car or personal loans instantly.', href: '/emi-calculator', badge: 'Popular' },
  { icon: '📈', title: 'SIP Calculator',              description: 'Calculate returns on your monthly SIP investments.', href: '/sip-calculator', badge: 'Popular' },
  { icon: '💰', title: 'Lumpsum Calculator',          description: 'Calculate returns on a one-time mutual fund investment.', href: '/lumpsum-calculator' },
  { icon: '🏦', title: 'PPF Calculator',              description: 'Calculate your Public Provident Fund returns & maturity.', href: '/ppf-calculator' },
  { icon: '🧾', title: 'Income Tax Calculator',       description: 'Calculate salary breakdown & income tax for FY 2025-26.', href: '/income-tax-calculator' },
  { icon: '📐', title: 'Graham Number Calculator',    description: "Find a stock's intrinsic value using Benjamin Graham's formula.", href: '/graham-number-calculator', badge: 'New' },
  { icon: '🔥', title: 'FIRE Calculator',             description: 'Calculate your Financial Independence number and years to early retirement.', href: '/fire-calculator', badge: 'New' },
  { icon: '📊', title: 'Sharpe Ratio Calculator',     description: "Measure your portfolio's risk-adjusted return quality.", href: '/sharpe-ratio-calculator', badge: 'New' },
];

const stats = [
  { value: '22+', label: 'Free Tools' },
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

      <section className="max-w-7xl mx-auto px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-lg">📄</div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">PDF Tools</h2>
            <p className="text-sm text-slate-500">Convert, merge, split and edit PDF files for free</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {pdfTools.map(t => <ToolCard key={t.href} {...t} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-lg">🧮</div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Financial Calculators</h2>
            <p className="text-sm text-slate-500">EMI, SIP, PPF, Income Tax and more</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {calculators.map(t => <ToolCard key={t.href} {...t} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-lg">🖼️</div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Image Tools</h2>
            <p className="text-sm text-slate-500">Convert and resize images in your browser</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {imageTools.map(t => <ToolCard key={t.href} {...t} />)}
        </div>
      </section>

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

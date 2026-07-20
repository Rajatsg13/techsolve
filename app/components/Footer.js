import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg width="32" height="32" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="0" y="0" width="72" height="72" rx="16" fill="#1e3a8a"/>
              <path d="M17 22 L31 36 L17 50" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="37" y1="50" x2="51" y2="50" stroke="white" strokeWidth="6" strokeLinecap="round"/>
            </svg>
            <span className="font-bold text-lg text-white">TechSolve<span className="text-brand-400">44</span></span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Free, fast, browser-based tools for everyone. No login. No downloads. Works on any device.
          </p>
        </div>

        {/* PDF Tools */}
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">PDF Tools</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/pdf-merge" className="hover:text-white transition-colors">PDF Merge</Link></li>
            <li><Link href="/pdf-compress" className="hover:text-white transition-colors">PDF Compress</Link></li>
            <li><Link href="/image-to-pdf" className="hover:text-white transition-colors">Image to PDF</Link></li>
            <li><Link href="/pdf-to-word" className="hover:text-white transition-colors">PDF to Word</Link></li>
            <li><Link href="/word-to-pdf" className="hover:text-white transition-colors">Word to PDF</Link></li>
          </ul>
        </div>

        {/* Calculators */}
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Calculators</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/emi-calculator" className="hover:text-white transition-colors">EMI Calculator</Link></li>
            <li><Link href="/sip-calculator" className="hover:text-white transition-colors">SIP Calculator</Link></li>
            <li><Link href="/lumpsum-calculator" className="hover:text-white transition-colors">Lumpsum Calculator</Link></li>
            <li><Link href="/ppf-calculator" className="hover:text-white transition-colors">PPF Calculator</Link></li>
            <li><Link href="/income-tax-calculator" className="hover:text-white transition-colors">Income Tax Calculator</Link></li>
            <li><Link href="/graham-number-calculator" className="hover:text-white transition-colors">Graham Number Calculator</Link></li>
            <li><Link href="/fire-calculator" className="hover:text-white transition-colors">FIRE Calculator</Link></li>
            <li><Link href="/sharpe-ratio-calculator" className="hover:text-white transition-colors">Sharpe Ratio Calculator</Link></li>
            <li><Link href="/stock-profit-calculator" className="hover:text-white transition-colors">Stock Profit Calculator</Link></li>
            <li><Link href="/mf-profit-calculator" className="hover:text-white transition-colors">MF Profit Calculator</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} TechSolve44, a division of GDB Advisories LLP. All rights reserved. All tools are free and run locally in your browser.
      </div>
    </footer>
  );
}

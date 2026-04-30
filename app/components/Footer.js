import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black">T</div>
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
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} TechSolve44. All rights reserved. All tools are free and run locally in your browser.
      </div>
    </footer>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const navGroups = [
  {
    label: 'PDF Tools',
    items: [
      { label: '🔗 Merge PDF',        href: '/pdf-merge' },
      { label: '✂️ Split PDF',        href: '/pdf-split' },
      { label: '📑 Organize Pages',   href: '/pdf-organize' },
      { label: '🗜️ Compress PDF',     href: '/pdf-compress' },
      { label: '📄 PDF to Word',      href: '/pdf-to-word' },
      { label: '📝 Word to PDF',      href: '/word-to-pdf' },
      { label: '🖼️ PDF to JPG',       href: '/pdf-to-jpg' },
      { label: '💧 Watermark PDF',    href: '/pdf-watermark' },
      { label: '🔢 Add Page Numbers', href: '/pdf-page-numbers' },
      { label: '🌐 HTML to PDF',      href: '/html-to-pdf' },
      { label: '🔍 OCR PDF',          href: '/pdf-ocr' },
      { label: '🔓 Remove Password',   href: '/pdf-unlock' },
    ],
  },
  {
    label: 'Image Tools',
    items: [
      { label: '🖼️ Image to PDF',     href: '/image-to-pdf' },
      { label: '📐 Image Resizer',    href: '/image-resize' },
      { label: '📷 Scan to PDF',      href: '/scan-to-pdf' },
    ],
  },
  {
    label: 'Calculators',
    items: [
      { label: '🏦 EMI Calculator',        href: '/emi-calculator' },
      { label: '📈 SIP Calculator',         href: '/sip-calculator' },
      { label: '💰 Lumpsum Calculator',     href: '/lumpsum-calculator' },
      { label: '🏛️ PPF Calculator',        href: '/ppf-calculator' },
      { label: '🧾 Income Tax Calculator',    href: '/income-tax-calculator' },
      { label: '📐 Graham Number Calculator', href: '/graham-number-calculator' },
      { label: '🔥 FIRE Calculator',           href: '/fire-calculator' },
      { label: '📊 Sharpe Ratio Calculator',   href: '/sharpe-ratio-calculator' },
    ],
  },
];

function DropdownMenu({ group, onClose }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
      {group.items.map(item => (
        <Link key={item.href} href={item.href} onClick={onClose}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-brand-700 transition-colors">
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [openGroup, setOpenGroup]   = useState(null);
  const [mobileOpen, setMobileOpen] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleMouseEnter = (label) => { clearTimeout(timerRef.current); setOpenGroup(label); };
  const handleMouseLeave = () => { timerRef.current = setTimeout(() => setOpenGroup(null), 150); };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <svg width="36" height="36" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="0" y="0" width="72" height="72" rx="16" fill="#1e3a8a"/>
            <path d="M17 22 L31 36 L17 50" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="37" y1="50" x2="51" y2="50" stroke="white" strokeWidth="6" strokeLinecap="round"/>
          </svg>
          <span className="font-bold text-xl text-brand-800 group-hover:text-brand-600 transition-colors">
            TechSolve<span className="text-brand-500">44</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navGroups.map(group => (
            <div key={group.label} className="relative"
              onMouseEnter={() => handleMouseEnter(group.label)}
              onMouseLeave={handleMouseLeave}>
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors rounded-lg hover:bg-slate-50">
                {group.label}
                <svg className={`w-3.5 h-3.5 transition-transform duration-150 ${openGroup === group.label ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openGroup === group.label && (
                <DropdownMenu group={group} onClose={() => setOpenGroup(null)} />
              )}
            </div>
          ))}
          <Link href="/" className="ml-2 px-4 py-2 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition-colors">
            All Tools
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-4">
          {navGroups.map((group, idx) => (
            <div key={group.label} className="border-b border-slate-100">
              <button
                className="w-full flex items-center justify-between py-3 text-sm font-semibold text-slate-700"
                onClick={() => setMobileOpen(mobileOpen === idx ? null : idx)}>
                {group.label}
                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${mobileOpen === idx ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileOpen === idx && (
                <div className="pl-3 pb-3 space-y-1">
                  {group.items.map(item => (
                    <Link key={item.href} href={item.href}
                      onClick={() => { setMenuOpen(false); setMobileOpen(null); }}
                      className="block py-2 text-sm text-slate-600 hover:text-brand-700 transition-colors">
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link href="/" onClick={() => setMenuOpen(false)}
            className="block mt-3 py-2 text-center bg-brand-700 text-white text-sm font-semibold rounded-lg">
            All Tools
          </Link>
        </div>
      )}
    </header>
  );
}

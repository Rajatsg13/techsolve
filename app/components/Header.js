'use client';
import { useState } from 'react';
import Link from 'next/link';

const navLinks = [
  { label: 'PDF Tools', href: '/pdf-merge' },
  { label: 'Calculators', href: '/emi-calculator' },
  { label: 'Image Tools', href: '/image-to-pdf' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-brand-700 flex items-center justify-center text-white font-black text-lg">
            T
          </div>
          <span className="font-bold text-xl text-brand-800 group-hover:text-brand-600 transition-colors">
            TechSolve<span className="text-brand-500">44</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/"
            className="ml-2 px-4 py-2 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition-colors">
            All Tools
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
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
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm font-medium text-slate-700 border-b border-slate-50 hover:text-brand-700">
              {l.label}
            </Link>
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

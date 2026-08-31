'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { getNavigationGroups } from '../lib/tools';
import Logo from './Logo';

function DropdownMenu({ group, onClose }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-60 bg-white rounded-2xl shadow-lift border border-ink-100 p-2 z-50">
      {group.items.map(item => (
        <Link key={item.href} href={item.href} onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
          {item.label}
        </Link>
      ))}
    </div>
  );
}

// Tool links come from the central registry (app/lib/tools.js) so the nav
// cannot drift from the homepage or sitemap. The registry already excludes
// legacy finance tools and empty categories — do not filter by status here.
const navGroups = getNavigationGroups();

export default function Header() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [openGroup, setOpenGroup]   = useState(null);
  const [mobileOpen, setMobileOpen] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleMouseEnter = (label) => { clearTimeout(timerRef.current); setOpenGroup(label); };
  const handleMouseLeave = () => { timerRef.current = setTimeout(() => setOpenGroup(null), 150); };

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-ink-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link href="/" aria-label="Tools by Decyfy — home" className="group">
          <Logo />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navGroups.map(group => (
            <div key={group.label} className="relative"
              onMouseEnter={() => handleMouseEnter(group.label)}
              onMouseLeave={handleMouseLeave}>
              <button className="flex items-center gap-1 px-3.5 py-2 text-sm font-semibold text-ink-600 hover:text-brand-700 transition-colors rounded-xl hover:bg-ink-50">
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
          <Link href="/#tools" className="ml-2 px-4 py-2 bg-ink-900 text-white text-sm font-semibold rounded-xl hover:bg-ink-800 transition-colors">
            Browse tools
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-xl hover:bg-ink-50" onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
          <svg className="w-6 h-6 text-ink-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-ink-100 px-4 pb-4">
          {navGroups.map((group, idx) => (
            <div key={group.label} className="border-b border-ink-100">
              <button
                className="w-full flex items-center justify-between py-3 text-sm font-semibold text-ink-800"
                onClick={() => setMobileOpen(mobileOpen === idx ? null : idx)}>
                {group.label}
                <svg className={`w-4 h-4 text-ink-400 transition-transform duration-150 ${mobileOpen === idx ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileOpen === idx && (
                <div className="pl-3 pb-3 space-y-1">
                  {group.items.map(item => (
                    <Link key={item.href} href={item.href}
                      onClick={() => { setMenuOpen(false); setMobileOpen(null); }}
                      className="block py-2 text-sm text-ink-600 hover:text-brand-700 transition-colors">
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link href="/#tools" onClick={() => setMenuOpen(false)}
            className="block mt-3 py-2.5 text-center bg-ink-900 text-white text-sm font-semibold rounded-xl">
            Browse tools
          </Link>
        </div>
      )}
    </header>
  );
}

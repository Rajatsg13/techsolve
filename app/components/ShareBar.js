'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

function IconWrap({ className = 'w-4 h-4', children }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

const LINKS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    color: 'text-green-600',
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    icon: <IconWrap><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></IconWrap>,
  },
  {
    key: 'x',
    label: 'X',
    color: 'text-slate-800',
    href: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    icon: <IconWrap><path d="M4 4l7.5 9.4L4.4 20H7l5.2-5.8L16.5 20H21l-8-10L20 4h-2.6l-4.8 5.4L8.4 4H4z" strokeWidth="1.2" fill="currentColor" stroke="none"/></IconWrap>,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    color: 'text-blue-700',
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    icon: <IconWrap><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></IconWrap>,
  },
  {
    key: 'email',
    label: 'Email',
    color: 'text-amber-600',
    href: (url, text) => `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
    icon: <IconWrap><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></IconWrap>,
  },
];

export default function ShareBar() {
  const pathname = usePathname();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('TechSolve44 — Free Online Tools');
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setUrl(window.location.href);
    setTitle(document.title || 'TechSolve44 — Free Online Tools');
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
    setOpen(false);
  }, [pathname]);

  // Close the menu on an outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Contact/thank-you pages have nothing worth sharing.
  if (pathname === '/contact/' || pathname?.startsWith('/thank-you')) return null;
  if (!url) return null;

  const nativeShare = async () => {
    setOpen(false);
    try {
      await navigator.share({ title, url });
    } catch (_) { /* user cancelled — nothing to do */ }
  };

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1200);
    } catch (_) { /* clipboard blocked — ignore */ }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 pt-2">
      <div className="flex items-center justify-between py-4 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          {pathname === '/' ? 'Find this useful? Share it.' : 'Found this tool useful? Share it.'}
        </p>

        <div className="relative" ref={wrapRef}>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-haspopup="true"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-sm font-bold rounded-xl transition-colors"
          >
            <IconWrap className="w-4 h-4"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 3.9M15.4 6.6 8.6 10.5"/></IconWrap>
            Share
          </button>

          {open && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              {canNativeShare && (
                <>
                  <button
                    type="button"
                    onClick={nativeShare}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-brand-700 transition-colors"
                  >
                    <IconWrap className="w-4 h-4 text-slate-500"><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></IconWrap>
                    More options…
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                </>
              )}

              {LINKS.map(({ key, label, color, href, icon }) => (
                <a
                  key={key}
                  href={href(url, title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-brand-700 transition-colors"
                >
                  <span className={color}>{icon}</span>
                  {label}
                </a>
              ))}

              <button
                type="button"
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-brand-700 transition-colors"
              >
                <IconWrap className={`w-4 h-4 ${copied ? 'text-green-600' : 'text-slate-500'}`}>
                  {copied
                    ? <path d="M20 6 9 17l-5-5"/>
                    : <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>}
                </IconWrap>
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

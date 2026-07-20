'use client';
import { useState, useRef, useEffect } from 'react';

const WEB3FORMS_KEY = '66f215ff-88b8-4266-b38a-e6aac88a5caa';

// Distinguishes these from the contact form in the inbox.
const SUBJECT = 'TechSolve44 Feedback Widget';

export default function FeedbackWidget() {
  const [open, setOpen]       = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState('idle');   // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const botcheck = useRef(null);
  const collapseTimer = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => () => clearTimeout(collapseTimer.current), []);

  // Move focus into the field when the form opens, so keyboard users are not
  // dropped back at the top of the page.
  useEffect(() => { if (open) textareaRef.current?.focus(); }, [open]);

  async function submit(e) {
    e.preventDefault();
    if (status === 'sending') return;
    if (!message.trim()) return;

    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: SUBJECT,
          from_name: 'TechSolve44 Feedback Widget',
          message: message.trim(),
          email: email.trim() || undefined,
          page: typeof window !== 'undefined' ? window.location.pathname : '',
          botcheck: botcheck.current?.value || '',
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Submission failed');
      }

      setStatus('sent');
      setMessage('');
      setEmail('');

      // gtag is defined globally in app/layout.js; guard anyway for ad blockers.
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'feedback_widget_submit');
      }

      collapseTimer.current = setTimeout(() => {
        setOpen(false);
        setStatus('idle');
      }, 4000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof TypeError
          ? 'Could not reach the server. Check your connection and try again.'
          : 'Something went wrong sending that. Please try again in a moment.'
      );
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 pb-12 pt-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">
              Didn&rsquo;t find the calculator you need?
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              Tell us what you&rsquo;re trying to calculate — we read every one.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setOpen(v => !v); setStatus('idle'); }}
            aria-expanded={open}
            aria-controls="feedback-widget-form"
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors flex-shrink-0"
          >
            {open ? 'Close' : 'Share it'}
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {open && (
          <div id="feedback-widget-form" className="mt-4 pt-4 border-t border-slate-100">
            {status === 'sent' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-green-800">Thanks — we read every submission.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <label htmlFor="feedback-message" className="block text-sm font-semibold text-slate-700 mb-1">
                    What are you trying to calculate?
                  </label>
                  <textarea
                    id="feedback-message" ref={textareaRef} required rows={3}
                    value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="e.g. I want to know whether paying with Axis Atlas or Infinia gives more value for Emirates flights"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="feedback-email" className="block text-sm font-semibold text-slate-700 mb-1">
                    Email <span className="text-slate-400 font-normal">— optional, if you&rsquo;d like a reply</span>
                  </label>
                  <input
                    id="feedback-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>

                {/* Honeypot — off-screen rather than type="hidden" so bots that
                    skip hidden inputs still fill it. Web3Forms rejects anything
                    submitted with this populated. */}
                <input
                  ref={botcheck} type="text" name="botcheck" tabIndex={-1}
                  autoComplete="off" aria-hidden="true"
                  className="absolute w-px h-px -left-[9999px] opacity-0 pointer-events-none"
                />

                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <p className="text-sm text-red-700">{errorMsg}</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
                  <p className="text-xs text-slate-400 max-w-sm">
                    By submitting, you may occasionally see an anonymized version of your feedback featured on our site.
                  </p>
                  <button
                    type="submit" disabled={status === 'sending' || !message.trim()}
                    className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex-shrink-0"
                  >
                    {status === 'sending' ? 'Sending…' : 'Send feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

'use client';
import { useState, useRef } from 'react';
import { submitToWeb3Forms, friendlyError } from '../lib/web3forms';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');     // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const botcheck = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    setErrorMsg('');

    try {
      await submitToWeb3Forms({
        subject: 'TechSolve44 Contact Form',
        from_name: 'TechSolve44 Contact Form',
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        botcheck: botcheck.current?.value || '',
      });
      setStatus('sent');
    } catch (err) {
      // Never claim delivery we cannot prove — the previous version of this page
      // showed "Message Sent!" unconditionally and dropped every message.
      setStatus('error');
      setErrorMsg(friendlyError(err));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Contact Us</h1>
      <p className="text-slate-500 mb-8">We&rsquo;d love to hear from you — tool suggestions, bug reports, or just a hello.</p>

      {status === 'sent' ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h2>
          <p className="text-green-700 text-sm">Thank you for reaching out. We&rsquo;ll get back to you within 24-48 hours.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-8 space-y-5 shadow-sm">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-1">Your Name</label>
            <input id="contact-name" required type="text" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Rajat Sharma" />
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input id="contact-email" required type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
            <textarea id="contact-message" required rows={5} value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              placeholder="Tell us about a bug, a tool suggestion, or anything else..." />
          </div>

          {/* Honeypot — off-screen rather than type="hidden" so bots that skip
              hidden inputs still fill it. Web3Forms rejects anything with it set. */}
          <input ref={botcheck} type="text" name="botcheck" tabIndex={-1}
            autoComplete="off" aria-hidden="true"
            className="absolute w-px h-px -left-[9999px] opacity-0 pointer-events-none" />

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-700">{errorMsg}</p>
              <p className="text-xs text-red-600 mt-1">
                Your message has not been sent. Please try again, or reach us another way if this keeps happening.
              </p>
            </div>
          )}

          <button type="submit" disabled={status === 'sending'}
            className="w-full py-3 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors">
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  );
}

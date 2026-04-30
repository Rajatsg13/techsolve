'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const submit = (e) => {
    e.preventDefault();
    // In production: wire up to Formspree, EmailJS, or your own API
    setSent(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Contact Us</h1>
      <p className="text-slate-500 mb-8">We'd love to hear from you — tool suggestions, bug reports, or just a hello.</p>

      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h2>
          <p className="text-green-700 text-sm">Thank you for reaching out. We'll get back to you within 24-48 hours.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-8 space-y-5 shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Your Name</label>
            <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Rajat Sharma" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
            <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              placeholder="Tell us about a bug, a tool suggestion, or anything else..." />
          </div>
          <button type="submit"
            className="w-full py-3 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl transition-colors">
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}

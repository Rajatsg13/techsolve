'use client';
import { useState } from 'react';
import CrossBrandCard from '../components/CrossBrandCard';

export default function PDFUnlock() {
  const [file, setFile]         = useState(null);
  const [password, setPassword] = useState('');
  const [needsPass, setNeedsPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setNeedsPass(false);
      setPassword('');
      setDone(false);
      setError('');
    }
  };

  const unlock = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setDone(false);

    try {
      const { PDFDocument } = await import('pdf-lib');
      const bytes = await file.arrayBuffer();

      let pdfDoc;
      const passToTry = needsPass ? password : '';

      try {
        pdfDoc = await PDFDocument.load(bytes, { password: passToTry });
      } catch (err) {
        const msg = err.message || '';
        // pdf-lib throws when a password is required
        if (!needsPass && (msg.includes('password') || msg.includes('encrypted') || msg.includes('encrypt'))) {
          setNeedsPass(true);
          setLoading(false);
          return;
        }
        if (needsPass && (msg.includes('password') || msg.includes('encrypted') || msg.includes('encrypt') || msg.includes('incorrect'))) {
          setError('Incorrect password. Please try again.');
          setLoading(false);
          return;
        }
        throw err;
      }

      // Save without any encryption — produces a plain, unlocked PDF
      const unlocked = await pdfDoc.save();
      const blob = new Blob([unlocked], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.pdf$/i, '');
      a.download = `${baseName}_unlocked.pdf`;
      a.click();
      setDone(true);
    } catch (e) {
      setError('Could not unlock this PDF. ' + (e.message || 'The file may use unsupported encryption.'));
    }

    setLoading(false);
  };

  const reset = () => {
    setFile(null);
    setPassword('');
    setNeedsPass(false);
    setDone(false);
    setError('');
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Remove PDF Password</h1>
      <p className="text-slate-500 mb-5 text-sm">
        Remove password protection from a PDF. Works on owner-locked PDFs (restrictions only) and user-password PDFs.
      </p>

      {/* Privacy assurance strip */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span className="text-xs font-semibold text-green-800">100% Private</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
          <span className="text-xs font-semibold text-blue-800">Runs in your browser</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
          </svg>
          <span className="text-xs font-semibold text-slate-600">No upload, no server</span>
        </div>
      </div>

      {/* Privacy detail block — only shown before a file is selected */}
      {!file && (
        <div className="bg-slate-800 text-slate-100 rounded-2xl p-5 mb-6 flex gap-4">
          <div className="text-2xl shrink-0">🛡️</div>
          <div>
            <p className="font-bold text-white text-sm mb-1">Your documents stay on your device — always</p>
            <p className="text-slate-300 text-xs leading-relaxed">
              This tool uses JavaScript that runs entirely inside your browser. When you select a PDF, it is read
              directly from your device memory — it is <strong className="text-white">never uploaded to any server</strong>,
              never stored, and never transmitted over the internet. The unlocked file is generated in your browser
              and downloaded straight to your device. We have zero access to your document or its contents.
            </p>
          </div>
        </div>
      )}

      {/* Upload */}
      {!file ? (
        <div className="drop-zone mb-6"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('unlock-input').click()}>
          <div className="text-4xl mb-3">🔓</div>
          <p className="font-semibold text-slate-700">Drop your PDF here or <span className="text-brand-700 underline">browse</span></p>
          <p className="text-xs text-slate-400 mt-1">Only PDF files accepted</p>
          <input id="unlock-input" type="file" accept=".pdf" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <span className="text-3xl">🔒</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-700 text-sm truncate">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={reset} className="text-xs text-red-500 hover:text-red-700 font-medium shrink-0">
            Remove
          </button>
        </div>
      )}

      {/* Password field — only shown if pdf-lib signals one is required */}
      {needsPass && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <p className="text-sm font-semibold text-amber-800 mb-3">🔑 This PDF is password-protected</p>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Enter the PDF password</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && unlock()}
            placeholder="Enter password…"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            autoFocus
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-sm text-red-700 font-medium">
          ❌ {error}
        </div>
      )}

      {/* Success */}
      {done && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
          <p className="font-bold text-green-800 mb-1">✅ Password removed!</p>
          <p className="text-sm text-green-700">Your unlocked PDF has been downloaded. Open another file to continue.</p>
          <button onClick={reset} className="mt-3 text-sm font-semibold text-brand-700 hover:text-brand-900 underline">
            Unlock another PDF
          </button>
        </div>
      )}

      {/* Action button */}
      {file && !done && (
        <button
          onClick={unlock}
          disabled={loading || (needsPass && !password.trim())}
          className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors text-base">
          {loading ? '⏳ Removing password…' : needsPass ? '🔓 Unlock PDF' : '🔓 Remove Password'}
        </button>
      )}

      <CrossBrandCard pageSlug="pdf-unlock" />

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['What types of PDF passwords can this remove?',
             'Two types: owner passwords (which restrict copying, editing, or printing — common in business PDFs) and user passwords (which require a password just to open the file). For owner-password PDFs it unlocks automatically. For user-password PDFs, you\'ll be asked to enter the password.'],
            ['Is my PDF uploaded anywhere?',
             'No. Everything runs entirely in your browser using JavaScript. Your file is never sent to any server. Not even a byte of it leaves your device.'],
            ['Why does it say the password is incorrect?',
             'The password entered doesn\'t match what was used to protect the file. PDF passwords are case-sensitive — check caps lock and try again. If you\'ve forgotten the password, this tool cannot help as it does not crack or brute-force passwords.'],
            ['What if the PDF still seems locked after downloading?',
             'A small number of PDFs use non-standard or very old encryption that pdf-lib cannot fully handle. In those cases try opening the file in Adobe Acrobat Reader, entering the password there, and printing to a new PDF using the system print dialog.'],
          ].map(([q, a]) => (
            <details key={q} className="faq-item bg-white border border-slate-100 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 font-semibold text-slate-700 text-sm flex justify-between items-center">
                {q}<span className="text-brand-600 text-lg faq-icon"></span>
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-600">{a}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

'use client';
import { useState } from 'react';

export default function WordToPDF() {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (f) => {
    if (f && (f.name.endsWith('.docx') || f.name.endsWith('.doc'))) setFile(f);
    else alert('Please upload a .docx file.');
  };

  const convert = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const mammoth = await import('mammoth');
      const bytes = await file.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer: bytes });

      // Use print-to-PDF via a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:210mm;height:297mm;';
      document.body.appendChild(iframe);
      iframe.contentDocument.write(`
        <!DOCTYPE html><html><head>
        <meta charset="utf-8">
        <style>
          body { font-family: Calibri, sans-serif; font-size: 12pt; line-height: 1.5; margin: 2cm; color: #222; }
          h1,h2,h3,h4 { font-weight: bold; margin-top: 1em; }
          p { margin: 0.4em 0; }
          table { border-collapse: collapse; width: 100%; }
          td,th { border: 1px solid #ccc; padding: 6px; }
        </style>
        </head><body>${html}</body></html>
      `);
      iframe.contentDocument.close();

      // Use pdf-lib to create a text-based PDF
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Strip HTML tags for raw text extraction
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const rawText = tmp.innerText || tmp.textContent;
      const lines = rawText.split('\n').filter(l => l.trim());

      const margin = 50;
      const pageWidth = 595, pageHeight = 842;
      const maxWidth = pageWidth - margin * 2;
      const fontSize = 11;
      const lineHeight = fontSize * 1.5;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      const wrapLine = (text) => {
        const words = text.split(' ');
        const wrapped = [];
        let current = '';
        for (const word of words) {
          const test = current ? current + ' ' + word : word;
          const w = font.widthOfTextAtSize(test, fontSize);
          if (w > maxWidth && current) { wrapped.push(current); current = word; }
          else { current = test; }
        }
        if (current) wrapped.push(current);
        return wrapped;
      };

      for (const line of lines) {
        const wrapped = wrapLine(line);
        for (const wl of wrapped) {
          if (y < margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          page.drawText(wl, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
          y -= lineHeight;
        }
        y -= 4;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.docx?$/, '.pdf');
      a.click();
      document.body.removeChild(iframe);
    } catch (e) { alert('Conversion failed: ' + e.message); }
    setLoading(false);
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">Word to PDF Converter</h1>
      <p className="text-slate-500 mb-2 text-sm">Convert Word (.docx) documents to PDF format. Free, private — runs in your browser.</p>
      <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
        ⚠️ Supports .docx files. Basic text & paragraph formatting is preserved.
      </div>

      <div className="ad-slot h-20 mb-8">[ AdSense — Leaderboard ]</div>

      {!file ? (
        <div className="drop-zone mb-6"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('wtp-input').click()}>
          <div className="text-4xl mb-3">📝</div>
          <p className="font-semibold text-slate-700">Drop your Word file here or <span className="text-brand-700 underline">browse</span></p>
          <p className="text-xs text-slate-400 mt-1">Accepts .docx files</p>
          <input id="wtp-input" type="file" accept=".docx,.doc" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <span className="text-3xl">📝</span>
          <div className="flex-1">
            <p className="font-semibold text-slate-700 text-sm">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={() => setFile(null)} className="text-xs text-red-500 font-medium">Remove</button>
        </div>
      )}

      <button onClick={convert} disabled={!file || loading}
        className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors text-base">
        {loading ? '⏳ Converting...' : '📄 Convert to PDF & Download'}
      </button>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['Does it support .doc files?', 'Currently only .docx (modern Word format) is fully supported. For .doc files, please open them in Microsoft Word and save as .docx first.'],
            ['Are images in my Word file included?', 'Embedded images and complex tables may not be fully preserved in the browser-based conversion. For high-fidelity results, use Microsoft Word\'s built-in "Export as PDF" feature.'],
            ['Is my document uploaded anywhere?', 'No — the conversion happens entirely in your browser. Your document never leaves your device.'],
          ].map(([q, a]) => (
            <details key={q} className="faq-item bg-white border border-slate-100 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 font-semibold text-slate-700 text-sm flex justify-between items-center">
                {q}<span className="text-brand-600 text-lg">+</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-600">{a}</div>
            </details>
          ))}
        </div>
      </section>
      <div className="ad-slot h-24 mt-10">[ AdSense — Rectangle ]</div>
    </div>
  );
}

'use client';
import { useState } from 'react';

export default function PDFToWord() {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleFile = (f) => { if (f?.type === 'application/pdf') { setFile(f); } };

  const convert = async () => {
    if (!file) return;
    setLoading(true);
    setProgress('Reading PDF...');
    try {
      // Load pdf.js from CDN
      if (!window.pdfjsLib) {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      const bytes = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
      setProgress(`Extracting text from ${pdf.numPages} pages...`);

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        fullText += `\n\n--- Page ${i} ---\n\n${pageText}`;
        setProgress(`Processing page ${i} of ${pdf.numPages}...`);
      }

      setProgress('Creating Word document...');
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
      const paragraphs = fullText.split('\n').map(line => {
        if (line.startsWith('--- Page')) {
          return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: line.replace(/---/g, '').trim(), bold: true })] });
        }
        return new Paragraph({ children: [new TextRun({ text: line, size: 24, font: 'Calibri' })] });
      });

      const doc = new Document({ sections: [{ children: paragraphs }] });
      const buffer = await Packer.toBlob(doc);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(buffer);
      a.download = file.name.replace('.pdf', '.docx');
      a.click();
      setProgress('Done!');
    } catch (e) { alert('Conversion failed: ' + e.message); }
    setLoading(false);
    setProgress('');
  };

  return (
    <div className="tool-container">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">PDF to Word Converter</h1>
      <p className="text-slate-500 mb-2 text-sm">Convert PDF files to editable Word (.docx) documents. Free, browser-based, no uploads.</p>
      <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
        ⚠️ Best for text-based PDFs. Scanned/image PDFs require OCR.
      </div>

      <div className="ad-slot h-20 mb-8">[ AdSense — Leaderboard ]</div>

      {!file ? (
        <div className="drop-zone mb-6"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('ptw-input').click()}>
          <div className="text-4xl mb-3">📄</div>
          <p className="font-semibold text-slate-700">Drop your PDF here or <span className="text-brand-700 underline">browse</span></p>
          <input id="ptw-input" type="file" accept=".pdf" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <span className="text-3xl">📄</span>
          <div className="flex-1">
            <p className="font-semibold text-slate-700 text-sm">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={() => setFile(null)} className="text-xs text-red-500 font-medium">Remove</button>
        </div>
      )}

      {loading && progress && (
        <div className="mb-4 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-sm text-brand-700 font-medium">
          ⏳ {progress}
        </div>
      )}

      <button onClick={convert} disabled={!file || loading}
        className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors text-base">
        {loading ? '⏳ Converting...' : '📝 Convert to Word & Download'}
      </button>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-800">
        <strong>How it works:</strong> This tool extracts the text content from your PDF and creates a clean Word document. Images, complex layouts, and scanned PDFs cannot be fully reconstructed in the browser — for those, a server-side tool like Adobe Acrobat or Smallpdf gives better results.
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            ['Why does the formatting look different?', 'Browser-based PDF-to-Word conversion extracts raw text — complex multi-column layouts, tables, and headers may not be perfectly preserved.'],
            ['Can it convert scanned PDFs?', 'No — scanned PDFs are images, not text. OCR (Optical Character Recognition) is required, which needs a more powerful server-side tool.'],
            ['Is my PDF uploaded anywhere?', 'No — the conversion runs entirely in your browser. Your PDF never leaves your device.'],
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

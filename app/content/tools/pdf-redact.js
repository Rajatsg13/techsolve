const content = {
  slug: 'pdf-redact',
  outcome: 'A PDF with the sensitive parts genuinely gone, not merely covered over.',
  whatItDoes: [
    'You drag boxes over whatever should not be visible, and the tool rebuilds those pages so the hidden content no longer exists in the file. The result cannot be selected, searched or copied back out, because there is nothing left underneath to find.',
    'This matters because the obvious approach does not work. Drawing a black rectangle over text in most PDF editors leaves the text exactly where it was, just hidden behind a shape — anyone can select it, copy it, or pull it out with a script. Documents have been leaked exactly this way.',
  ],
  limitations: [
    'Pages you redact are converted to images. Their text stops being selectable and searchable, and the file gets larger. This is the mechanism that makes the removal real, not a shortcut — there is no way to have both on the same page.',
    'Pages you do not redact are copied across untouched and keep their text.',
    'Redaction is visual: it removes what is inside the boxes you drew. It does not remove document metadata, attachments or content hidden elsewhere in the file.',
  ],
  whenToUse: [
    { title: 'Sharing a document with parts that must not travel', body: 'Bank details, identifiers, salaries, addresses, medical information.' },
    { title: 'Sending evidence or records to a third party', body: 'Where a specific extract is needed and everything else should stay private.' },
    { title: 'Publishing something internal', body: 'Case studies and reports usually need names and figures removed before they leave the building.' },
  ],
  workplaceUses: [
    { title: 'Legal disclosure and records requests', body: 'Produce documents with only the disclosable parts visible.' },
    { title: 'HR and payroll paperwork', body: 'Share a document without exposing salaries, bank accounts or identifiers.' },
    { title: 'Client work used as a reference', body: 'Remove the client’s identifying details before a case study or pitch.' },
    { title: 'Vendor and procurement documents', body: 'Circulate a contract internally with pricing or counterparty terms removed.' },
  ],
  howToSteps: [
    { title: 'Add your PDF', body: 'Up to 100 MB. The first page appears ready to mark up.' },
    { title: 'Drag over what should go', body: 'Each drag adds a black box. Add as many as you need on a page.' },
    { title: 'Move between pages', body: 'The page dropdown shows how many redactions each page carries, so nothing is forgotten.' },
    { title: 'Adjust before exporting', body: 'Remove a box with the × in its corner, clear one page, or clear everything. Nothing is applied until you export.' },
    { title: 'Check the summary', body: 'Above the button you are told how many redactions there are and which pages will become images.' },
    { title: 'Download and verify', body: 'Open the result and try selecting the redacted area. There should be nothing to select.' },
  ],
  tips: [
    { title: 'Cover a little more than you think you need', body: 'Text sits slightly above and below its visible marks. A box drawn exactly to the letters can leave a sliver of the line beneath it.' },
    { title: 'Check the whole document, not just the obvious page', body: 'The same detail often reappears in a header, a footer, a summary table or an appendix.' },
    { title: 'Verify the output yourself', body: 'Open the downloaded file and try to select and copy the redacted region. This takes seconds and is the only check that actually matters.' },
    { title: 'Redact before you compress, not after', body: 'Redacted pages are images already, and compressing them afterwards only degrades them further.' },
    { title: 'This does not clear metadata', body: 'Author names, timestamps and similar properties can still be present. If those matter for your document, deal with them separately.' },
  ],
  faqs: [
    { q: 'Is the text really gone, or just hidden?', a: 'Really gone from the redacted pages. Those pages are rebuilt from a rendered image with the black boxes painted in before the image is made, and the original page object is never written into the output. There is no layer beneath to recover.' },
    { q: 'Why can I no longer select text on the pages I redacted?', a: 'Because that is what makes the redaction real. The page became an image. Keeping the text selectable would mean keeping the text — including the part you wanted removed. Pages you did not redact are untouched and still selectable.' },
    { q: 'Why did my file get bigger?', a: 'An image of a page takes more space than the text that produced it. That is the cost of the content actually being gone.' },
    { q: 'Does this remove metadata and hidden data?', a: 'No. It removes what is inside the boxes you drew on the pages you redacted. Document properties, attachments and any content outside those areas are unaffected. Do not treat it as a general sanitiser.' },
    { q: 'Can I still search the document afterwards?', a: 'Only the pages you did not redact. Redacted pages have no text layer. You could run the result through OCR to make it searchable again, but that would only recover the text still visible — not what you removed.' },
    { q: 'Is my document uploaded?', a: 'No. Rendering and rebuilding happen in your browser, and nothing is stored after you close the tab.' },
  ],
  relatedWorkflows: [
    {
      title: 'Share an extract of a longer document',
      description: 'Send only the relevant pages, with sensitive details removed.',
      steps: [
        { slug: 'pdf-split', note: 'Take only the pages that need to be shared' },
        { slug: 'pdf-redact', note: 'Remove the sensitive parts' },
        { label: 'Open the result and confirm nothing selects' },
      ],
    },
  ],
  relatedTools: ['pdf-split', 'pdf-sign', 'pdf-compress', 'pdf-watermark'],
};
export default content;

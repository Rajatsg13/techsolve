const content = {
  slug: 'pdf-sign',
  outcome: 'A PDF with your signature visible where you placed it.',
  whatItDoes: [
    'You type your name in a signature style or draw it with a finger or mouse, position it on the page, and download the signed document. The signature is drawn onto the page as an image; the rest of the file is left exactly as it was.',
    'The signature can go on one page, on specific pages, or on every page — useful when a contract wants initials throughout as well as a signature at the end.',
  ],
  limitations: [
    'This is a visible signature, not a certified digital signature. It does not use a certificate, does not verify who you are, and does not seal the document against later changes. Anyone can edit the file afterwards and nothing will detect it.',
  ],
  whenToUse: [
    { title: 'Returning a form or agreement', body: 'The common case: someone sends a PDF and asks for it back signed.' },
    { title: 'You have no printer', body: 'It saves the print, sign, scan cycle, which is the usual reason people end up with bad phone photos of paperwork.' },
    { title: 'Initialling several pages', body: 'Some agreements want a mark on every page, not only the last one.' },
  ],
  workplaceUses: [
    { title: 'Approvals and sign-offs', body: 'Purchase requests, timesheets and internal forms that need a visible authorisation.' },
    { title: 'Letters and certificates', body: 'Add a signature block to something you have generated rather than printing it to sign it.' },
    { title: 'Routine agreements', body: 'Engagement letters, NDAs and consent forms where a visible signature is what the other side actually expects.' },
    { title: 'Delivery and acknowledgement notes', body: 'Sign on a phone with a finger, then send the file straight back.' },
  ],
  howToSteps: [
    { title: 'Add your PDF', body: 'Up to 100 MB. The first page appears ready to sign.' },
    { title: 'Type or draw your signature', body: 'Typing offers three styles. Drawing works with a finger on a phone or the mouse on a computer, and can be cleared and redone.' },
    { title: 'Choose the ink colour', body: 'Dark blue is a common convention for distinguishing a signature from printed black text.' },
    { title: 'Place it', body: 'Drag the box where the signature belongs, and drag its corner to resize. Pick the page from the dropdown to preview a different one.' },
    { title: 'Decide which pages get it', body: 'This page only, every page, or a list such as 1, 3, 5-7.' },
    { title: 'Download', body: 'The signature is drawn onto the chosen pages and the file downloads.' },
  ],
  tips: [
    { title: 'Check the preview page you are placing on', body: 'The position you set is used on every page you apply it to. If those pages have different layouts, check that the spot works on all of them.' },
    { title: 'Drawing on a phone gives a better signature', body: 'A finger on a touchscreen produces a more natural line than a mouse.' },
    { title: 'Keep the signature inside the page', body: 'The box cannot leave the page, but placing it right against an edge risks it landing in the margin a printer will not reach.' },
    { title: 'Ask what the recipient needs', body: 'If someone has asked for a digitally signed or certified document, this is not that. They mean a certificate-based signature, which needs different software.' },
  ],
  faqs: [
    { q: 'Is this a legally binding signature?', a: 'That depends entirely on your jurisdiction, the type of document and what the parties agreed — not on this tool. What it produces is the equivalent of signing a printout: a visible mark you placed deliberately. Many everyday agreements are accepted this way, and many formal ones are not. If it matters, ask someone qualified.' },
    { q: 'Is this a digital signature or e-signature service?', a: 'No. There is no certificate, no identity check, no audit trail and no tamper detection. It draws a signature onto the page. If you need a certified signature, use a service built for that.' },
    { q: 'Can someone remove the signature afterwards?', a: 'The signature is drawn into the page content rather than being a separate annotation, so it is not simply deletable in a reader. But this is not a security feature and should not be treated as one.' },
    { q: 'Does signing flatten my document?', a: 'No. The original pages are kept as they are and the signature is drawn on top, so text elsewhere stays selectable and searchable.' },
    { q: 'Is my document uploaded anywhere?', a: 'No. Everything happens in your browser, and neither the document nor your signature is stored after you close the tab.' },
    { q: 'Can I save a signature to reuse?', a: 'No. Nothing is stored between visits, so you draw or type it again each time. That is the trade-off for keeping nothing about you.' },
  ],
  relatedWorkflows: [
    {
      title: 'Sign and return a document',
      description: 'Receive an agreement, sign it, and send back something reasonably sized.',
      steps: [
        { slug: 'pdf-sign', note: 'Add your signature where it belongs' },
        { slug: 'pdf-compress', note: 'Reduce the size if it needs emailing' },
        { label: 'Send it back' },
      ],
    },
  ],
  relatedTools: ['pdf-redact', 'pdf-merge', 'pdf-compress', 'pdf-watermark'],
};
export default content;

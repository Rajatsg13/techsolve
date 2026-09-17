const content = {
  slug: 'invoice-generator',
  outcome: 'A professional invoice PDF, built from your line items in your own browser.',
  whatItDoes: [
    'You enter your business details, your customer, and one row per thing you are billing for. The tool totals the invoice and produces a PDF you can download, print or email.',
    'Tax is applied per line rather than to the subtotal, so an invoice that mixes an 18% service and a 5% item comes out with the right figure and shows each rate separately. Discounts work at two levels: a percentage on an individual line, and a percentage on the whole invoice — the second recalculates tax on the reduced value rather than leaving it overstated.',
  ],
  whenToUse: [
    { title: 'You bill occasionally', body: 'A few invoices a month does not justify accounting software or a subscription. This covers the document itself.' },
    { title: 'You need it to look right', body: 'A spreadsheet printed to PDF reads like a spreadsheet. This produces something laid out as an invoice.' },
    { title: 'You do not want your numbers on someone else’s server', body: 'Client names and amounts stay on your device. Nothing is uploaded.' },
  ],
  workplaceUses: [
    { title: 'Freelance and consulting work', body: 'Bill by hours or by deliverable, add a retainer line, and set your own payment terms in the notes.' },
    { title: 'Mixed tax rates on one bill', body: 'Goods at one rate and services at another, each taxed correctly and shown split by rate.' },
    { title: 'Inter-state supply', body: 'Switch to IGST and the tax appears as a single line instead of the CGST and SGST split.' },
  ],
  howToSteps: [
    { title: 'Fill in your business and your customer', body: 'Name is required for both. GSTIN, address and contact details are optional and only print when you supply them.' },
    { title: 'Add your line items', body: 'Description, quantity and rate. Discount and tax percentages are per line — leave them blank when they do not apply.' },
    { title: 'Set the invoice number and dates', body: 'Numbering is yours to decide; the tool does not generate or track sequence for you.' },
    { title: 'Choose the tax treatment', body: 'Leave "inter-state" off for CGST + SGST, or switch it on for IGST.' },
    { title: 'Check the running total, then download', body: 'The summary updates as you type. The Download button stays disabled until the required fields are filled, and tells you what is missing.' },
  ],
  tips: [
    { title: 'Amounts print as "Rs."', body: 'The standard PDF fonts cannot encode the ₹ symbol, so the PDF writes "Rs." instead. This is a deliberate trade-off to keep the tool small and instant rather than downloading a font.' },
    { title: 'Non-Latin characters are dropped', body: 'For the same reason, names in Devanagari or other Indic scripts cannot be drawn. The tool warns you which field is affected rather than silently mangling it — transliterate those to Latin script.' },
    { title: 'Long descriptions wrap, they do not overflow', body: 'A long line item wraps inside its column and the row grows. Very long invoices continue onto further pages with the table header repeated.' },
    { title: 'Round-off is shown, not hidden', body: 'If you round the total to whole rupees, the rounding amount appears as its own line so the invoice still adds up.' },
  ],
  faqs: [
    { q: 'Is this a GST-compliant tax invoice?', a: 'It produces the layout and the tax breakdown a tax invoice normally carries, including per-rate splits and amount in words. Whether a given invoice meets your obligations depends on your registration and what you are supplying — that is worth confirming with your accountant. This tool does not decide which rate applies to what you sell.' },
    { q: 'Are my invoices saved anywhere?', a: 'No. Nothing is stored and nothing is uploaded. Closing the tab discards what you entered, so download the PDF before you leave.' },
    { q: 'Can I add my logo?', a: 'Not currently. The PDF uses a typographic header with your business name.' },
    { q: 'Can I edit an invoice after downloading it?', a: 'Not from the PDF. Re-enter the details and generate again — or keep the PDF and issue a credit note if it has already gone out.' },
    { q: 'Does it track what has been paid?', a: 'No. This creates the document only; it is not an accounts-receivable system.' },
  ],
  relatedWorkflows: [
    {
      title: 'Send an invoice with supporting documents',
      description: 'Bill for a project and attach the timesheet or delivery note as one file.',
      steps: [
        { slug: 'invoice-generator', note: 'Create and download the invoice' },
        { slug: 'pdf-merge', note: 'Combine it with your supporting pages' },
        { label: 'Email the single PDF to your customer' },
      ],
    },
  ],
  relatedTools: ['gst-calculator', 'profit-margin-calculator', 'pdf-merge', 'payslip-generator'],
};
export default content;

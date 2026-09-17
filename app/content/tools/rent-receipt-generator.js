const content = {
  slug: 'rent-receipt-generator',
  outcome: 'A rent receipt PDF for one rent period, in the format employers expect for HRA.',
  whatItDoes: [
    'You enter the landlord, the tenant, the property, the amount and the period the rent covers. The tool produces a receipt PDF with the amount written out in words, a signature line for the landlord, and an optional box for a physical revenue stamp.',
    'It covers one payment for one period. For a full year of HRA proof, generate one receipt per month or per quarter, depending on what your employer asks for.',
  ],
  whenToUse: [
    { title: 'Your employer wants HRA proof', body: 'Most payroll teams ask for rent receipts before they will allow the exemption in your salary.' },
    { title: 'Your landlord does not issue receipts', body: 'Common with individual landlords. Generate the receipt, then have them sign it.' },
    { title: 'You need a record of what you paid', body: 'A dated receipt is worth having even when nobody has asked for one.' },
  ],
  workplaceUses: [
    { title: 'Annual HRA submission', body: 'Produce receipts covering the months your employer requires, with the landlord’s PAN where the annual rent makes it necessary.' },
    { title: 'Shared accommodation', body: 'Issue a receipt for the share one tenant actually paid, rather than the whole rent.' },
    { title: 'Landlords issuing to tenants', body: 'A landlord can use it the other way round — generate the receipt to hand over, signed.' },
  ],
  howToSteps: [
    { title: 'Enter the landlord', body: 'Name is required. PAN matters when annual rent is above Rs. 1,00,000 — the tool points this out when your figure implies that, but still generates without it.' },
    { title: 'Enter the tenant and the property', body: 'The property address is what the receipt is for, so it is required.' },
    { title: 'Enter the amount, the period and the payment date', body: 'The period defaults to the current calendar month. A period that ends before it starts is caught before you can generate.' },
    { title: 'Choose the payment mode', body: 'Bank transfer, UPI, cheque, cash or card. Add a UTR or cheque number as the reference if you have one.' },
    { title: 'Add a revenue stamp box if you need one', body: 'This draws an outlined placeholder next to the signature. It does not add a stamp — you affix a real one after printing.' },
    { title: 'Download and get it signed', body: 'The receipt is not complete until the landlord signs it.' },
  ],
  tips: [
    { title: 'Check the amount in words', body: 'It is generated from the figure you typed, in lakh and crore grouping. If the words look wrong, the number is wrong.' },
    { title: 'The revenue stamp is conventionally for cash', body: 'It is generally expected on cash payments above Rs. 5,000, and generally not needed for bank transfers. Practice varies — ask whoever is going to accept the receipt.' },
    { title: 'One receipt per period', body: 'Do not combine several months into one receipt unless the rent was genuinely paid as a single payment for that whole span.' },
    { title: 'Amounts print as "Rs."', body: 'The standard PDF fonts cannot encode ₹, and Indic scripts cannot be drawn. Names in those scripts need transliterating; the tool tells you which field is affected.' },
  ],
  faqs: [
    { q: 'Will my employer accept this receipt?', a: 'The layout carries what employers usually ask for — landlord details and PAN, tenant, property, amount, period, payment mode and a signature line. Acceptance is still their call, and some ask for a rent agreement or the landlord’s PAN declaration alongside it.' },
    { q: 'Do I need the landlord’s PAN?', a: 'Employers generally require it once annual rent exceeds Rs. 1,00,000. The tool flags this when your monthly figure implies that threshold, but the exact requirement is set by your employer and the rules that apply to you.' },
    { q: 'Is a revenue stamp mandatory?', a: 'Not always. It is conventionally used for cash payments above Rs. 5,000. The tool only draws the box; you affix the physical stamp.' },
    { q: 'Can I generate twelve months at once?', a: 'No — one receipt per period. Generate each one, then combine them into a single PDF if that is easier to submit.' },
    { q: 'Is this proof of payment on its own?', a: 'It is a receipt, not evidence that money moved. Keep your bank statement or UPI record too — that is what actually shows the payment happened.' },
  ],
  relatedWorkflows: [
    {
      title: 'Submit a year of rent receipts',
      description: 'Produce each period’s receipt and hand in one file.',
      steps: [
        { slug: 'rent-receipt-generator', note: 'Generate a receipt for each period' },
        { label: 'Get each one signed by the landlord' },
        { slug: 'image-to-pdf', note: 'Scan the signed copies back to PDF' },
        { slug: 'pdf-merge', note: 'Combine them into one file to submit' },
      ],
    },
  ],
  relatedTools: ['invoice-generator', 'payslip-generator', 'pdf-merge', 'image-to-pdf'],
};
export default content;

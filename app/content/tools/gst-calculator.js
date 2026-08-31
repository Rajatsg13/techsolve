const content = {
  slug: 'gst-calculator',
  outcome: 'Add GST to a price, or work out how much GST is already inside a figure you have been quoted.',
  whatItDoes: [
    'GST calculations run in two directions and people mix them up constantly. Adding GST to a net amount is simple multiplication. Extracting GST from a total that already includes it is not — taking 18% off a GST-inclusive ₹1,180 gives ₹967.60, which is wrong. The correct base is ₹1,000, because the ₹180 of tax was calculated on the base, not on the total.',
    'This handles both, and shows the CGST/SGST and IGST splits side by side. Which split applies depends on whether the supply crosses a state border — that is a fact about the transaction, not something a calculator can infer, so both are shown.',
  ],
  whenToUse: [
    { title: 'Quoting a client', body: 'You know what you want to earn; you need the figure to put on the invoice with tax added.' },
    { title: 'A supplier quoted an inclusive price', body: 'You need the base value to record, and the tax portion to claim as input credit.' },
    { title: 'Checking an invoice you received', body: 'Confirm the tax line matches the rate and the base before it goes into the books.' },
    { title: 'Pricing a product', body: 'Work backwards from the shelf price a customer will accept to the revenue you actually keep.' },
  ],
  workplaceUses: [
    { title: 'Preparing a quotation', body: 'Show the client a net figure, a tax line and a total that add up correctly.' },
    { title: 'Reconciling a purchase invoice', body: 'Split an inclusive total into base and tax so each posts to the right ledger.' },
    { title: 'Setting a retail price', body: 'Decide the inclusive price first, then check what net revenue is left after tax.' },
    { title: 'Checking a vendor’s arithmetic', body: 'A quick confirmation that the tax charged matches the rate claimed.' },
  ],
  howToSteps: [
    { title: 'Say what your amount is', body: 'Excluding GST means tax will be added on top. Including GST means the figure already contains tax and will be worked backwards.' },
    { title: 'Enter the amount', body: 'The rupee value you are starting from.' },
    { title: 'Pick a rate', body: 'Tap 5, 12, 18 or 28 for the common slabs, or type any other rate in the field below.' },
    { title: 'Read the split', body: 'The total, the base and the tax appear immediately, with CGST/SGST shown for supply within a state and IGST for supply between states.' },
  ],
  tips: [
    { title: 'Never subtract the rate to remove GST', body: 'Taking 18% off an inclusive ₹1,180 gives ₹967.60. The right answer is ₹1,000, found by dividing by 1.18. The Including GST mode does this for you.' },
    { title: 'CGST and SGST are each half the rate', body: 'An 18% intra-state supply is 9% CGST plus 9% SGST — not 18% each. The total tax is the same either way; only the split differs.' },
    { title: 'Use IGST when the supply crosses a state line', body: 'Inter-state supply carries the whole rate as IGST. Which applies depends on place of supply rules, so check the transaction rather than guessing.' },
    { title: 'Rounding differences are normal', body: 'Invoicing systems round each line, then the total. A rupee or two of difference against this calculator is usually rounding, not error.' },
    { title: 'The rate depends on the goods or service', body: 'This tool does the arithmetic for whatever rate you give it. It cannot tell you which rate is correct for what you sell.' },
  ],
  faqs: [
    { q: 'How do I remove GST from an inclusive amount?', a: 'Switch to Including GST and enter the total. The base is the total divided by (1 + rate ÷ 100), and the tax is the difference. Subtracting the percentage directly gives the wrong answer.' },
    { q: 'What is the difference between CGST, SGST and IGST?', a: 'For supply within a single state the tax is split equally into CGST (central) and SGST (state). For supply between states the whole amount is charged as IGST. The total tax is identical; only the allocation differs.' },
    { q: 'Which GST rate applies to my product?', a: 'This calculator cannot tell you. Rates depend on classification and change with policy. Check the current schedule or ask your accountant — the tool handles the arithmetic once you know the rate.' },
    { q: 'Is this tax advice?', a: 'No. It performs a calculation you specify. It does not know your registration status, place of supply, input credit position or filing obligations. For anything that affects a return, use a qualified professional.' },
    { q: 'Can I use a rate that is not in the list?', a: 'Yes. The preset buttons cover the common slabs, but the rate field accepts any value, including cess percentages you want to model separately.' },
    { q: 'Does it handle rounding the way an invoice would?', a: 'It shows unrounded figures to two decimal places. Accounting systems apply their own rounding at line and invoice level, so small differences against a real invoice are expected.' },
  ],
  relatedWorkflows: [
    {
      title: 'Producing a quotation or invoice',
      description: 'From the figure you want to earn to a document you can send.',
      steps: [
        { slug: 'profit-margin-calculator', note: 'Set the price that gives you the margin you need' },
        { slug: 'gst-calculator', note: 'Add GST to reach the figure the client pays' },
        { slug: 'invoice-generator', note: 'Produce the invoice itself' },
      ],
    },
  ],
  relatedTools: ['profit-margin-calculator', 'percentage-calculator', 'invoice-generator'],
};

export default content;

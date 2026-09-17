const content = {
  slug: 'salary-hike-calculator',
  outcome: 'Turn a hike percentage into an actual figure, or find out what percentage an offer really represents.',
  whatItDoes: [
    'Salary conversations happen in two currencies. Employers talk in percentages; the number that matters to you is rupees, and specifically rupees per month. This converts between them in both directions.',
    'Give it a percentage and it returns the new salary and the monthly difference. Give it two salaries and it returns the percentage — useful when comparing offers that are quoted as figures rather than increments.',
  ],
  whenToUse: [
    { title: 'An appraisal percentage was announced', body: 'Working out what the number actually means in monthly terms.' },
    { title: 'Comparing a job offer', body: 'A new salary quoted as a figure, expressed as the hike it represents.' },
    { title: 'Preparing for a negotiation', body: 'Knowing what percentage a target figure needs before the conversation.' },
    { title: 'Comparing two offers', body: 'Putting both on the same percentage basis against your current package.' },
  ],
  workplaceUses: [
    { title: 'Appraisal season', body: 'Translating an announced percentage into a monthly figure.' },
    { title: 'Evaluating an offer', body: 'Seeing the real increase over your current package, not just the headline number.' },
    { title: 'Budgeting an increment cycle', body: 'For a manager, the cost of a proposed percentage across a team.' },
    { title: 'Planning a counter-offer', body: 'Working backwards from the figure you want to the percentage to ask for.' },
  ],
  howToSteps: [
    { title: 'Choose what you know', body: 'The hike percentage, or the new salary figure.' },
    { title: 'Enter your current annual salary', body: 'Use the same basis on both sides — gross annual is usual, but as long as it is consistent the percentage is right.' },
    { title: 'Enter the percentage or the offer', body: 'Whichever you selected.' },
    { title: 'Read the monthly difference', body: 'Shown alongside the annual figure, because that is the number that shows up in your account.' },
  ],
  tips: [
    { title: 'These are gross figures', body: 'The monthly increase shown is before tax and deductions. What reaches your account will be lower, and how much lower depends on your tax situation.' },
    { title: 'Compare like with like', body: 'A CTC figure including bonus, insurance and employer contributions is not the same as take-home. Put both offers on the same basis before comparing.' },
    { title: 'A percentage on a small base is a small amount', body: 'A 20% hike on a low salary can be less money than 8% on a high one. The rupee figure decides, not the percentage.' },
    { title: 'Look at the whole package', body: 'A lower percentage with better leave, insurance or flexibility may be worth more than a higher number. This tool only measures the salary line.' },
    { title: 'A negative result means a pay cut', body: 'If an offer is below your current salary the result is negative and labelled as such — sometimes worth accepting for other reasons, but worth seeing plainly.' },
  ],
  faqs: [
    { q: 'How do I calculate my salary after a hike?', a: 'Multiply your current salary by (1 + hike ÷ 100). A 12% hike on ₹600,000 gives ₹672,000. The first mode does this and also shows the monthly difference.' },
    { q: 'How do I work out the percentage between two salaries?', a: '(New − Current) ÷ Current × 100. Going from ₹600,000 to ₹750,000 is a 25% hike. The second mode does this.' },
    { q: 'Is the monthly figure my take-home increase?', a: 'No. It is the gross annual increase divided by twelve, before income tax, provident fund and any other deductions. Your actual take-home increase will be lower.' },
    { q: 'Should I use CTC or take-home?', a: 'Either, as long as you use the same measure on both sides. Mixing a CTC figure with a take-home figure produces a percentage that describes nothing real.' },
    { q: 'Does it account for tax?', a: 'No. Tax depends on your regime, deductions and exemptions, which this tool does not ask for and should not guess at. It gives the gross change.' },
    { q: 'Is my salary information stored?', a: 'No. Everything is calculated in your browser as you type. Nothing is sent anywhere or saved.' },
  ],
  relatedTools: ['percentage-increase-calculator', 'percentage-calculator', 'payslip-generator'],
};

export default content;

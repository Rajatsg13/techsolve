const content = {
  slug: 'payslip-generator',
  outcome: 'A clear salary slip PDF for one employee and one pay period.',
  whatItDoes: [
    'You enter the employer, the employee, and the earnings and deductions that make up the month. The tool totals gross earnings, total deductions and net pay, then produces a payslip PDF with earnings and deductions side by side and net pay stated in figures and words.',
    'The components are yours to name. Basic, HRA, conveyance, a one-off bonus, a recovery — add whatever rows the month actually had rather than fitting the pay into a fixed template.',
  ],
  whenToUse: [
    { title: 'A small team without payroll software', body: 'A handful of salaried staff, paid monthly, where a full payroll system is more than the situation needs.' },
    { title: 'An employee needs a payslip for a bank or a landlord', body: 'Loan and rental applications routinely ask for recent payslips.' },
    { title: 'A correction to a month already run', body: 'Reissue a single slip without touching the rest of the payroll.' },
  ],
  workplaceUses: [
    { title: 'Monthly salary slips', body: 'One slip per employee per month, with the components your business actually uses.' },
    { title: 'Partial months', body: 'Record paid days and loss-of-pay days so a mid-month joiner or a period of unpaid leave can be reconciled against the amounts.' },
    { title: 'Contract and consultant payments', body: 'A single earnings line and no statutory deductions produces a simple statement of what was paid.' },
  ],
  howToSteps: [
    { title: 'Enter the employer and the pay period', body: 'The period is free text — "August 2026" or "1–15 August 2026", whatever describes what you paid for.' },
    { title: 'Enter the employee', body: 'Name is required. Employee ID, designation, department, PAN, UAN and bank account are optional and print only when filled.' },
    { title: 'Add earnings', body: 'One row per component. Two common rows are there to start with; rename or remove them freely.' },
    { title: 'Add deductions', body: 'Same idea. Leave the section empty if there are none — net pay then equals gross.' },
    { title: 'Check net pay and download', body: 'Gross, deductions and net update as you type. Download produces the PDF.' },
  ],
  tips: [
    { title: 'The tool does not calculate statutory deductions', body: 'PF, ESI, professional tax and TDS are entered as amounts you have already worked out. Nothing here computes them or checks them against current rules.' },
    { title: 'A negative net is allowed, and flagged', body: 'If deductions exceed earnings the slip still generates — recoveries do happen — but you get a warning so a typo does not slip through unnoticed.' },
    { title: 'Mask the bank account yourself', body: 'Whatever you type is printed as typed. If you only want the last four digits on the slip, enter only those.' },
    { title: 'Amounts print as "Rs."', body: 'The standard PDF fonts cannot encode ₹, and non-Latin scripts cannot be drawn. The tool warns you which field is affected rather than mangling it quietly.' },
  ],
  faqs: [
    { q: 'Does this calculate PF, ESI or income tax?', a: 'No. It is a document generator, not a payroll engine. You enter the deduction amounts and it presents them clearly and totals them. Anything that has to be right for compliance should be worked out in payroll software or with your accountant.' },
    { q: 'Is a payslip from this tool valid?', a: 'It is a salary statement issued by you, the employer, and it carries a note saying so. Whether a bank or landlord accepts it is their decision. It is not issued by any payroll authority and does not pretend to be.' },
    { q: 'Can I generate slips for a whole team at once?', a: 'No — one employee and one period per PDF. For a team, generate each slip and combine them if you want a single file.' },
    { q: 'Is salary data uploaded anywhere?', a: 'No. Everything stays in your browser, and nothing is stored after you close the tab.' },
  ],
  relatedWorkflows: [
    {
      title: 'Issue a month of payslips as one file',
      description: 'Generate each employee’s slip, then combine them for your records.',
      steps: [
        { slug: 'payslip-generator', note: 'Generate one slip per employee' },
        { slug: 'pdf-merge', note: 'Combine them into a single monthly file' },
        { label: 'File it with your payroll records' },
      ],
    },
  ],
  relatedTools: ['salary-hike-calculator', 'invoice-generator', 'pdf-merge', 'rent-receipt-generator'],
};
export default content;

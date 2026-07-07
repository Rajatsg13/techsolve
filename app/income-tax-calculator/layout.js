import { toolMetadata } from '../lib/toolMeta';
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Should I choose old or new tax regime in FY 2025-26?',
      acceptedAnswer: { '@type': 'Answer', text: 'If your total deductions (80C, 80D, HRA, home loan interest) exceed ₹3.75 lakh, the old regime typically saves more tax. If your deductions are low or you prefer simplicity, the new regime is better. Use our calculator to compare both regimes with your exact salary.' },
    },
    {
      '@type': 'Question',
      name: 'What is the Section 87A rebate in FY 2025-26?',
      acceptedAnswer: { '@type': 'Answer', text: 'Under the new tax regime, if your taxable income is ₹12 lakh or below, you pay zero tax due to the Section 87A rebate. Under the old regime, the rebate applies if taxable income is ₹5 lakh or below, making your effective tax zero.' },
    },
    {
      '@type': 'Question',
      name: 'What is the standard deduction in FY 2025-26?',
      acceptedAnswer: { '@type': 'Answer', text: 'In FY 2025-26, the standard deduction is ₹75,000 under the new tax regime and ₹50,000 under the old tax regime. It is automatically deducted from your gross salary before calculating taxable income.' },
    },
    {
      '@type': 'Question',
      name: 'What deductions are available under the old regime?',
      acceptedAnswer: { '@type': 'Answer', text: 'Under the old regime, you can claim: Section 80C up to ₹1.5 lakh (PPF, ELSS, LIC, EPF), Section 80D up to ₹50,000 (health insurance), Section 24B up to ₹2 lakh (home loan interest), Section 80CCD(1B) up to ₹50,000 (NPS), and Section 80E (education loan interest, no limit).' },
    },
  ],
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Income Tax Calculator India FY 2025-26',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Free income tax calculator for India FY 2025-26. Compare old vs new tax regime side-by-side with full deductions — 80C, 80D, HRA, home loan interest. See which regime saves you more.',
  url: 'https://techsolve44.com/income-tax-calculator/',
  featureList: [
    'Old vs new regime comparison FY 2025-26',
    'Section 87A rebate applied automatically',
    '80C, 80D, 24B, 80CCD(1B) deductions for old regime',
    'Standard deduction ₹75,000 (new) / ₹50,000 (old)',
    'Salary + CTC mode',
    'HRA exemption calculation',
  ],
};

export const metadata = toolMetadata('/income-tax-calculator/', {
  title: 'Income Tax Calculator FY 2025-26 — Old vs New Regime India',
  description:
    'Free income tax calculator for FY 2025-26. Compare old vs new tax regime with 80C, 80D, HRA deductions. Section 87A rebate included. Instantly see which saves you more.',
  keywords: [
    'income tax calculator 2025-26 india',
    'old vs new regime calculator 2025-26',
    'income tax calculator india 2025',
    'new tax regime calculator fy 2025-26',
    'section 87a rebate calculator',
    '80c 80d hra tax calculator india',
  ],
  openGraph: {
    title: 'Income Tax Calculator FY 2025-26 — Old vs New Regime',
    description:
      'Compare old and new tax regime for FY 2025-26. Full deductions included. See which regime saves you more tax.',
  },
});

export default function IncomeTaxLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}

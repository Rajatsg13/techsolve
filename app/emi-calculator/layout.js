import { toolMetadata } from '../lib/toolMeta';
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is EMI?',
      acceptedAnswer: { '@type': 'Answer', text: 'EMI (Equated Monthly Instalment) is the fixed monthly amount you pay to repay a loan. It includes both principal and interest components, calculated so the loan is fully paid off by the end of the tenure.' },
    },
    {
      '@type': 'Question',
      name: 'How is EMI calculated?',
      acceptedAnswer: { '@type': 'Answer', text: 'EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is the principal loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the loan tenure in months.' },
    },
    {
      '@type': 'Question',
      name: 'What EMI can I afford?',
      acceptedAnswer: { '@type': 'Answer', text: 'Financial advisors recommend keeping your total EMI outgo under 40% of your monthly take-home salary. For example, if you earn ₹60,000/month, your total EMIs should not exceed ₹24,000.' },
    },
    {
      '@type': 'Question',
      name: 'Does prepayment reduce EMI?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Making a partial prepayment reduces your outstanding principal. Depending on your bank, this either reduces your EMI amount or shortens your loan tenure. Prepaying in the early years saves the most interest.' },
    },
    {
      '@type': 'Question',
      name: 'What is the best loan tenure for a home loan?',
      acceptedAnswer: { '@type': 'Answer', text: 'Shorter tenure means higher EMI but significantly lower total interest paid. Longer tenure reduces EMI but increases total interest cost. Use our EMI calculator to compare both scenarios with your actual numbers.' },
    },
  ],
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'EMI Calculator India',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Free EMI calculator for home loan, car loan and personal loan in India. Get your monthly EMI instantly with principal vs interest breakup. No login required.',
  url: 'https://techsolve44.com/emi-calculator/',
  featureList: [
    'Monthly EMI calculation',
    'Total interest payable',
    'Principal vs interest breakup chart',
    'Supports home loan, car loan, personal loan',
    'Tenure in years or months',
  ],
};

export const metadata = toolMetadata('/emi-calculator/', {
  title: 'EMI Calculator India — Home, Car & Personal Loan EMI',
  description:
    'Free EMI calculator for home loan, car loan and personal loan in India. Calculate monthly EMI instantly with full principal vs interest breakup. No login required.',
  keywords: [
    'emi calculator india',
    'home loan emi calculator',
    'car loan emi calculator',
    'personal loan emi calculator',
    'emi calculator with amortization table india',
    'loan emi calculator 2025',
  ],
  openGraph: {
    title: 'EMI Calculator India — Free Loan EMI Calculator',
    description:
      'Calculate EMI for any loan in seconds. Principal vs interest chart included. No login, no data stored.',
  },
});

export default function EMILayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}

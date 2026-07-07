import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'FIRE Calculator India',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Free FIRE calculator for India. Calculate your Financial Independence Retire Early number using the 4% safe withdrawal rule. Find out how many years until you can retire early.',
  url: 'https://techsolve44.com/fire-calculator/',
  featureList: [
    'FIRE corpus calculation using 4% rule',
    'Years to FIRE based on savings rate',
    'India-specific cost of living estimates',
    'Lakh/Crore number formatting',
    'Adjustable return and inflation rates',
  ],
};

export const metadata = toolMetadata('/fire-calculator/', {
  title: 'FIRE Calculator India — Financial Independence Retire Early',
  description:
    'Free FIRE calculator for India. Calculate your FIRE number and years to retire early using the 4% rule. India-specific formatting with Lakh/Crore amounts.',
  keywords: [
    'FIRE calculator india',
    'financial independence calculator india',
    'retire early calculator india',
    'FIRE number india',
    '4% rule calculator india',
    'retirement corpus calculator india',
  ],
  openGraph: {
    title: 'FIRE Calculator India — Free Financial Independence Calculator',
    description:
      'Calculate your FIRE number and years to retire early. Uses 4% safe withdrawal rule. India-first.',
  },
});

export default function FIRELayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}

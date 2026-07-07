import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PPF Calculator India',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Free PPF (Public Provident Fund) calculator for India. Calculate your PPF maturity value, total interest earned and year-wise balance at the current 7.1% interest rate.',
  url: 'https://techsolve44.com/ppf-calculator/',
  featureList: [
    'PPF maturity value at 7.1% p.a.',
    'Year-by-year balance growth chart',
    'Total interest earned calculation',
    'Supports 15-year and extended tenure',
    'Tax-free returns calculation',
  ],
};

export const metadata = toolMetadata('/ppf-calculator/', {
  title: 'PPF Calculator India — Public Provident Fund Returns Calculator',
  description:
    'Free PPF calculator for India. Calculate PPF maturity value and total interest at 7.1% p.a. See year-by-year balance growth. No login required.',
  keywords: [
    'ppf calculator india',
    'public provident fund calculator',
    'ppf maturity calculator',
    'ppf interest calculator 2025',
    'ppf returns calculator india',
    'ppf 15 year calculator',
  ],
  openGraph: {
    title: 'PPF Calculator India — Free Public Provident Fund Calculator',
    description:
      'Calculate PPF maturity value and interest at current 7.1% rate. Year-by-year growth chart included.',
  },
});

export default function PPFLayout({ children }) {
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

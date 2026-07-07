import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SIP Calculator India',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Free SIP calculator for mutual fund investments in India. Calculate maturity value, total invested and estimated returns for your Systematic Investment Plan.',
  url: 'https://techsolve44.com/sip-calculator/',
  featureList: [
    'SIP maturity value calculation',
    'Total invested vs estimated returns',
    'Year-by-year growth chart',
    'Supports up to 40-year investment horizon',
    'India rupee formatting (Lakh/Crore)',
  ],
};

export const metadata = toolMetadata('/sip-calculator/', {
  title: 'SIP Calculator India — Mutual Fund SIP Returns Calculator',
  description:
    'Free SIP calculator for India. Calculate your mutual fund SIP maturity value, total returns and year-by-year growth. No login required.',
  keywords: [
    'sip calculator india',
    'sip returns calculator',
    'mutual fund sip calculator',
    'systematic investment plan calculator',
    'sip calculator 2025 india',
    'monthly sip maturity value calculator',
  ],
  openGraph: {
    title: 'SIP Calculator India — Free Mutual Fund SIP Calculator',
    description:
      'Calculate SIP maturity value and returns for any investment period. Year-by-year growth chart included.',
  },
});

export default function SIPLayout({ children }) {
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

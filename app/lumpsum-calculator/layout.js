import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Lumpsum Calculator India',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Free lumpsum investment calculator for India. Calculate the future value of a one-time investment using CAGR. See year-by-year wealth growth.',
  url: 'https://techsolve44.com/lumpsum-calculator/',
  featureList: [
    'Lumpsum maturity value using CAGR',
    'Year-by-year wealth growth chart',
    'Principal vs returns comparison',
    'Supports up to 30-year investment horizon',
    'India rupee formatting (Lakh/Crore)',
  ],
};

export const metadata = toolMetadata('/lumpsum-calculator/', {
  title: 'Lumpsum Calculator India — One-Time Investment Returns (CAGR)',
  description:
    'Free lumpsum investment calculator for India. Calculate the future value of a one-time mutual fund investment using CAGR. See year-by-year growth.',
  keywords: [
    'lumpsum calculator india',
    'one time investment calculator',
    'lumpsum mutual fund calculator',
    'cagr calculator india',
    'lumpsum returns calculator',
    'one time investment returns india',
  ],
  openGraph: {
    title: 'Lumpsum Calculator India — Free CAGR Investment Calculator',
    description:
      'Calculate returns on a one-time mutual fund investment. Year-by-year growth chart included. No login.',
  },
});

export default function LumpsumLayout({ children }) {
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

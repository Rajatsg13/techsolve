import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Graham Number Calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: "Free Graham Number calculator. Find a stock's intrinsic value using Benjamin Graham's formula — enter EPS and Book Value Per Share to check if a stock is undervalued or overvalued.",
  url: 'https://techsolve44.com/graham-number-calculator/',
  featureList: [
    "Graham Number = √(22.5 × EPS × BVPS)",
    'Undervalued vs overvalued stock signal',
    'Works for any stock market (India, US, global)',
    'No login required',
  ],
};

export const metadata = toolMetadata('/graham-number-calculator/', {
  title: 'Graham Number Calculator — Stock Intrinsic Value (Benjamin Graham)',
  description:
    "Free Graham Number calculator. Enter EPS and Book Value Per Share to find a stock's intrinsic value using Benjamin Graham's formula. Check if a stock is undervalued.",
  keywords: [
    'graham number calculator',
    'intrinsic value calculator',
    'benjamin graham formula',
    'stock intrinsic value calculator india',
    'undervalued stocks calculator',
    'graham number formula',
  ],
  openGraph: {
    title: 'Graham Number Calculator — Free Stock Intrinsic Value Tool',
    description:
      "Calculate a stock's Graham Number to find its intrinsic value. Based on Benjamin Graham's formula.",
  },
});

export default function GrahamLayout({ children }) {
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

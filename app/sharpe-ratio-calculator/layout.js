import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Sharpe Ratio Calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Free Sharpe Ratio calculator. Measure the risk-adjusted return of your portfolio or mutual fund. Enter portfolio return, risk-free rate and standard deviation.',
  url: 'https://techsolve44.com/sharpe-ratio-calculator/',
  featureList: [
    'Sharpe Ratio = (Rp - Rf) / σ',
    'Portfolio performance vs risk-free rate',
    'Interpretation guide (good/bad/excellent)',
    'Works for stocks, mutual funds, and portfolios',
    'No login required',
  ],
};

export const metadata = toolMetadata('/sharpe-ratio-calculator/', {
  title: 'Sharpe Ratio Calculator — Risk-Adjusted Return of Portfolio',
  description:
    'Free Sharpe Ratio calculator. Measure risk-adjusted returns of your portfolio or mutual fund. Enter return, risk-free rate and standard deviation. No login required.',
  keywords: [
    'sharpe ratio calculator',
    'risk adjusted return calculator',
    'portfolio performance calculator india',
    'sharpe ratio formula',
    'mutual fund sharpe ratio calculator',
    'investment risk calculator india',
  ],
  openGraph: {
    title: 'Sharpe Ratio Calculator — Free Risk-Adjusted Return Tool',
    description:
      'Calculate the Sharpe Ratio of your portfolio or fund. Measure risk-adjusted performance instantly.',
  },
});

export default function SharpeLayout({ children }) {
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

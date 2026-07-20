import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Mutual Fund Profit Calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description:
    'Free mutual fund profit calculator. Search any Indian MF scheme, pick buy and sell dates, and see absolute profit, XIRR and capital gains tax on your investment.',
  url: 'https://techsolve44.com/mf-profit-calculator/',
  featureList: [
    'Search 10,000+ Indian mutual fund schemes by name',
    'Historical NAV lookup for any buy and sell date',
    'Lump sum and SIP modes',
    'XIRR (annualised return) calculation',
    'LTCG and STCG capital gains tax estimate',
    'No login required',
  ],
};

export const metadata = toolMetadata('/mf-profit-calculator/', {
  title: 'Mutual Fund Profit Calculator — Calculate MF Returns & XIRR Free',
  description:
    'Calculate mutual fund profit, XIRR, and tax on gains. Search any Indian MF scheme, pick dates, see returns. Free, no login.',
  keywords: [
    'mutual fund profit calculator',
    'mf return calculator india',
    'xirr calculator mutual fund',
    'mutual fund gain calculator',
    'mf capital gains tax calculator',
    'sip return calculator with nav',
  ],
  openGraph: {
    title: 'Mutual Fund Profit Calculator — Free MF Returns & XIRR Tool',
    description:
      'Search any Indian mutual fund, pick buy and sell dates, and see profit, XIRR and capital gains tax instantly.',
  },
});

export default function MFProfitLayout({ children }) {
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

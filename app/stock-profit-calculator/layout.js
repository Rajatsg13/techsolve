import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Stock Profit Calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description:
    'Free stock profit calculator for Indian markets. Calculate net trading profit after brokerage, STT, GST, SEBI charges, stamp duty, DP charges and capital gains tax.',
  url: 'https://techsolve44.com/stock-profit-calculator/',
  featureList: [
    'Net profit after every statutory charge',
    'Zerodha equity delivery defaults built in',
    'Full charge-by-charge breakdown table',
    'STCG and LTCG capital gains tax estimate',
    'All charge rates editable for any broker',
    'No login required',
  ],
};

export const metadata = toolMetadata('/stock-profit-calculator/', {
  title: 'Stock Profit Calculator — Share Trading Profit After Charges & Tax',
  description:
    'Calculate stock trading profit after brokerage, STT, GST, SEBI charges, stamp duty and capital gains tax. Zerodha defaults included. Free, no login.',
  keywords: [
    'stock profit calculator india',
    'share profit calculator after charges',
    'stock trading profit calculator',
    'brokerage calculator zerodha',
    'capital gains calculator shares india',
    'stt calculator equity delivery',
  ],
  openGraph: {
    title: 'Stock Profit Calculator — Free Share Profit & Brokerage Tool',
    description:
      'See your real net profit after brokerage, STT, GST, stamp duty, DP charges and capital gains tax.',
  },
});

export default function StockProfitLayout({ children }) {
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

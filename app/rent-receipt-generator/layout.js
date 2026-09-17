import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Rent Receipt Generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Create a rent receipt PDF free for HRA claims. Covers one rent period, with amount in words, landlord PAN and an optional revenue stamp box. Built in your browser.',
  url: 'https://tools.decyfy.com/rent-receipt-generator/',
  featureList: ['Amount in words', 'Landlord PAN field for HRA', 'Optional revenue stamp box', 'Any rent period', 'Instant PDF download', 'Browser-only, no upload'],
};

export const metadata = toolMetadata('/rent-receipt-generator/', {
  title: 'Free Rent Receipt Generator — Rent Receipt PDF for HRA',
  description: 'Create a rent receipt PDF free for HRA claims. Covers one rent period, with amount in words, landlord PAN and an optional revenue stamp box. Built in your browser.',
  keywords: ['rent receipt generator', 'rent receipt format pdf', 'hra rent receipt', 'rent receipt for income tax', 'free rent receipt maker', 'rent receipt with revenue stamp'],
  openGraph: {
    title: 'Free Rent Receipt Generator — HRA-Ready Receipt PDFs',
    description: 'Generate a rent receipt PDF for your HRA claim. Free, no signup, nothing uploaded.',
  },
});

export default function Layout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}

import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Invoice Generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Create and download a professional invoice PDF free. Add line items, per-line GST rates and discounts. Built entirely in your browser — your business data is never uploaded.',
  url: 'https://tools.decyfy.com/invoice-generator/',
  featureList: ['Per-line tax rates', 'CGST/SGST and IGST split', 'Line and invoice-level discounts', 'Amount in words', 'Instant PDF download', 'Browser-only, no upload'],
};

export const metadata = toolMetadata('/invoice-generator/', {
  title: 'Free Invoice Generator — Create an Invoice PDF Online',
  description: 'Create and download a professional invoice PDF free. Add line items, per-line GST rates and discounts. Built entirely in your browser — your business data is never uploaded.',
  keywords: ['free invoice generator', 'invoice generator india', 'gst invoice format pdf', 'create invoice online free', 'tax invoice generator', 'invoice maker no signup'],
  openGraph: {
    title: 'Free Invoice Generator — GST-Ready Invoice PDFs',
    description: 'Create a professional invoice PDF in your browser. Free, no signup, nothing uploaded.',
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

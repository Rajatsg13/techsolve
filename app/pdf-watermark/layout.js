import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Add Watermark to PDF Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Add text watermark to PDF files free online. Customise font, size, opacity and position. No signup, no file upload — all processing in your browser.',
  url: 'https://techsolve44.com/pdf-watermark/',
  featureList: ['Add text watermark to PDF', 'Customise font, size, opacity', 'Diagonal and horizontal positioning', 'Browser-only processing', 'Free, no account needed'],
};

export const metadata = toolMetadata('/pdf-watermark/', {
  title: 'Watermark PDF Free Online — Add Text Watermark to PDF',
  description: 'Add text watermark to PDF files free online. Customise font size, opacity and position. No signup required. Files processed in your browser.',
  keywords: ['watermark pdf free online', 'add watermark to pdf free', 'pdf watermark tool online', 'text watermark pdf india', 'watermark pdf no signup', 'add stamp to pdf free'],
  openGraph: {
    title: 'Watermark PDF Free — Add Text Watermark Online',
    description: 'Add custom text watermarks to PDF. Free, no signup, files never leave your device.',
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

import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Add Page Numbers to PDF Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Add page numbers to PDF files free online. Choose position (header/footer), starting number and font size. No signup, files processed in your browser.',
  url: 'https://techsolve44.com/pdf-page-numbers/',
  featureList: ['Add page numbers to PDF', 'Choose header or footer position', 'Custom starting page number', 'Browser-only processing', 'Free, no account needed'],
};

export const metadata = toolMetadata('/pdf-page-numbers/', {
  title: 'Add Page Numbers to PDF Free Online — PDF Page Numbering Tool',
  description: 'Add page numbers to PDF free online. Choose position, starting number and format. No signup required. Files processed entirely in your browser.',
  keywords: ['add page numbers to pdf free', 'pdf page numbering online free', 'number pages in pdf free', 'add page numbers pdf india', 'pdf pagination tool free', 'insert page numbers pdf free'],
  openGraph: {
    title: 'Add Page Numbers to PDF Free — Online PDF Tool',
    description: 'Add page numbers to any PDF. Choose position and format. Free, no signup.',
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

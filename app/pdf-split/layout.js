import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Split PDF Online Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Split a PDF into separate pages or extract specific pages — free, no signup. All processing in your browser. Files never uploaded to any server.',
  url: 'https://techsolve44.com/pdf-split/',
  featureList: ['Split PDF into individual pages', 'Extract specific page ranges', 'Browser-only processing', 'No file upload to server', 'Free, no account needed'],
};

export const metadata = toolMetadata('/pdf-split/', {
  title: 'Split PDF Free Online — Split PDF into Pages or Extract Pages',
  description: 'Split PDF files free online. Extract specific pages or split into individual pages. No signup required. Files processed entirely in your browser.',
  keywords: ['split pdf free online', 'split pdf into pages', 'extract pages from pdf free', 'pdf splitter online free', 'split pdf no signup india', 'separate pdf pages free'],
  openGraph: {
    title: 'Split PDF Free — Extract Pages from PDF in Browser',
    description: 'Split PDFs or extract specific pages. Free, no signup, files never leave your device.',
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

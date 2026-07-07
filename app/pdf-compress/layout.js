import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Compress PDF Free Online',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Compress PDF file size without losing quality — free, no signup. All processing happens in your browser. Files never uploaded to any server.',
  url: 'https://techsolve44.com/pdf-compress/',
  featureList: ['Reduce PDF file size', 'No quality loss', 'Browser-only processing', 'No file upload to server', 'Free, no account needed'],
};

export const metadata = toolMetadata('/pdf-compress/', {
  title: 'Compress PDF Free — Reduce PDF File Size Without Quality Loss',
  description: 'Compress PDF files free online. Reduce file size without losing quality. No signup required. Files processed in your browser — never uploaded to any server.',
  keywords: ['compress pdf free online', 'reduce pdf file size free', 'compress pdf without losing quality', 'compress pdf below 1mb free', 'pdf compressor online india', 'compress pdf no signup'],
  openGraph: {
    title: 'Compress PDF Free — Reduce File Size in Browser',
    description: 'Compress PDF files without quality loss. Free, no signup, files never leave your device.',
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

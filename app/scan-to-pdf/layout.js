import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Scan to PDF Online Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Scan documents to PDF using your device camera — free, no signup. Capture, crop and convert to PDF instantly in your browser.',
  url: 'https://techsolve44.com/scan-to-pdf/',
  featureList: ['Camera-based document scanning', 'Auto crop and perspective correction', 'Convert to PDF instantly', 'No app download needed', 'Free, no account needed'],
};

export const metadata = toolMetadata('/scan-to-pdf/', {
  title: 'Scan to PDF Free — Document Scanner Online Using Camera',
  description: 'Scan documents to PDF free using your phone or laptop camera. No app download, no signup. Capture, crop and convert to PDF instantly in your browser.',
  keywords: ['scan to pdf free online', 'document scanner online free', 'scan document to pdf camera', 'mobile scanner to pdf free', 'scan pdf no app india', 'camera scan to pdf free'],
  openGraph: {
    title: 'Scan to PDF Free — Online Document Scanner',
    description: 'Scan documents to PDF using your camera. Free, no app download, no signup.',
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

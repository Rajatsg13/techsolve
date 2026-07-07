import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Merge PDF Online Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Merge multiple PDF files into one — free, no signup, no file size limit. All processing happens in your browser. Your files are never uploaded to a server.',
  url: 'https://techsolve44.com/pdf-merge/',
  featureList: ['Merge unlimited PDF files', 'Drag-and-drop reordering', 'Browser-only processing', 'No file upload to server', 'Free, no account needed'],
};

export const metadata = toolMetadata('/pdf-merge/', {
  title: 'Merge PDF Free Online — Combine PDF Files in Browser',
  description: 'Merge multiple PDF files into one for free. No signup, no file size limit. Files processed entirely in your browser — never uploaded to any server. 100% private.',
  keywords: ['merge pdf free online', 'combine pdf files free', 'merge pdf without upload', 'merge pdf india free', 'online pdf merger no signup', 'join pdf files free'],
  openGraph: {
    title: 'Merge PDF Free — Combine PDFs in Browser, No Upload',
    description: 'Merge PDF files instantly. Free, no signup, files never leave your device.',
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

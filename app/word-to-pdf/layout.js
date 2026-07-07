import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Word to PDF Converter Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Convert Word (.docx) documents to PDF free online. No signup, no file upload — all conversion happens in your browser.',
  url: 'https://techsolve44.com/word-to-pdf/',
  featureList: ['Convert Word (.docx) to PDF', 'Preserves formatting', 'Browser-only processing', 'No file upload to server', 'Free, no account needed'],
};

export const metadata = toolMetadata('/word-to-pdf/', {
  title: 'Word to PDF Converter Free — Convert DOCX to PDF Online',
  description: 'Convert Word documents to PDF free online. Upload your .docx file and download a PDF instantly. No signup required. Files never uploaded to any server.',
  keywords: ['word to pdf converter free', 'docx to pdf free online', 'convert word to pdf india', 'word to pdf no signup', 'microsoft word to pdf free', 'online word to pdf converter'],
  openGraph: {
    title: 'Word to PDF Free — Convert DOCX to PDF Online',
    description: 'Convert Word documents to PDF. Free, no signup, files never leave your device.',
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

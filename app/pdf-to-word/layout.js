import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PDF to Word Converter Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Convert PDF to editable Word (.docx) document free online. No signup, no file upload — all conversion happens in your browser.',
  url: 'https://techsolve44.com/pdf-to-word/',
  featureList: ['Convert PDF to Word (.docx)', 'Preserves text formatting', 'Browser-only processing', 'No file upload to server', 'Free, no account needed'],
};

export const metadata = toolMetadata('/pdf-to-word/', {
  title: 'PDF to Word Converter Free — Convert PDF to Editable DOCX Online',
  description: 'Convert PDF to Word document free online. Get an editable .docx file instantly. No signup required. Files processed in your browser, never uploaded.',
  keywords: ['pdf to word converter free', 'pdf to docx free online', 'convert pdf to word india', 'pdf to word no signup', 'pdf to editable word free', 'online pdf to word converter'],
  openGraph: {
    title: 'PDF to Word Free — Convert PDF to Editable DOCX Online',
    description: 'Convert PDF to editable Word document. Free, no signup, files never leave your device.',
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

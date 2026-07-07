import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OCR PDF Online Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Extract text from scanned PDFs using OCR — free, no signup. Convert scanned documents to searchable, editable text in your browser.',
  url: 'https://techsolve44.com/pdf-ocr/',
  featureList: ['OCR text extraction from scanned PDFs', 'Supports Hindi and English text', 'Browser-based OCR', 'No file upload to server', 'Free, no account needed'],
};

export const metadata = toolMetadata('/pdf-ocr/', {
  title: 'OCR PDF Online Free — Extract Text from Scanned PDF',
  description: 'Free OCR tool to extract text from scanned PDFs. Convert scanned documents to editable text. No signup required. Works in your browser.',
  keywords: ['ocr pdf online free', 'extract text from scanned pdf free', 'ocr pdf india', 'scanned pdf to text free', 'pdf ocr no signup', 'ocr pdf hindi text online free'],
  openGraph: {
    title: 'OCR PDF Free — Extract Text from Scanned Documents',
    description: 'Extract text from scanned PDFs using OCR. Free, no signup, no file upload.',
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

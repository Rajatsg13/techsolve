import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PDF to JPG Converter Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Convert PDF pages to JPG images free online. Extract every page as a high-quality image. No signup, files processed in your browser.',
  url: 'https://techsolve44.com/pdf-to-jpg/',
  featureList: ['Convert PDF pages to JPG', 'High-quality image extraction', 'Browser-only processing', 'No file upload to server', 'Free, no account needed'],
};

export const metadata = toolMetadata('/pdf-to-jpg/', {
  title: 'PDF to JPG Converter Free — Convert PDF Pages to Images Online',
  description: 'Convert PDF to JPG images free online. Extract all pages as high-quality images. No signup required. Files processed entirely in your browser.',
  keywords: ['pdf to jpg converter free', 'pdf to image free online', 'convert pdf to jpg india', 'pdf to jpg no signup', 'pdf pages to images free', 'extract images from pdf free'],
  openGraph: {
    title: 'PDF to JPG Free — Convert PDF Pages to Images Online',
    description: 'Convert PDF pages to JPG images. High quality, free, no signup.',
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

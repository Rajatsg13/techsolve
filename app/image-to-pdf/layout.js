import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Image to PDF Converter Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Convert JPG, PNG or other images to PDF for free. Combine multiple images into a single PDF. No signup, no file upload — works in your browser.',
  url: 'https://techsolve44.com/image-to-pdf/',
  featureList: ['Convert JPG/PNG to PDF', 'Combine multiple images into one PDF', 'Browser-only processing', 'No file upload to server', 'Free, no account needed'],
};

export const metadata = toolMetadata('/image-to-pdf/', {
  title: 'Image to PDF Converter Free — JPG PNG to PDF Online',
  description: 'Convert JPG, PNG or any image to PDF free online. Combine multiple images into one PDF. No signup required. Works entirely in your browser.',
  keywords: ['image to pdf converter free', 'jpg to pdf free online', 'png to pdf converter', 'convert images to pdf free', 'multiple images to pdf free', 'photo to pdf free india'],
  openGraph: {
    title: 'Image to PDF Free — Convert JPG/PNG to PDF Online',
    description: 'Convert images to PDF free. Combine multiple photos into one PDF. No signup, no upload.',
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

import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free HEIC to JPG Converter',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Convert iPhone HEIC photos to JPG, PNG or WebP free. Convert several at once. Runs entirely in your browser — your photos are never uploaded.',
  url: 'https://tools.decyfy.com/heic-to-jpg/',
  featureList: ['Batch conversion up to 30 photos', 'JPG, PNG and WebP output', 'Adjustable quality', 'Detects HEIC by file contents', 'Browser-only, no upload'],
};

export const metadata = toolMetadata('/heic-to-jpg/', {
  title: 'HEIC to JPG Converter Free — Convert iPhone Photos Online',
  description: 'Convert iPhone HEIC photos to JPG, PNG or WebP free. Convert several at once. Runs entirely in your browser — your photos are never uploaded.',
  keywords: ['heic to jpg', 'convert heic to jpg free', 'iphone photo to jpg', 'heic converter online', 'heic to jpeg no upload', 'open heic on windows'],
  openGraph: {
    title: 'Free HEIC to JPG — Convert iPhone Photos in Your Browser',
    description: 'Convert HEIC photos to JPG, PNG or WebP. Free, private, nothing uploaded.',
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

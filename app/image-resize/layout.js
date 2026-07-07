import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Image Resizer Online Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Resize images online for free. Resize by pixels or percentage. No signup, no file upload — all processing in your browser.',
  url: 'https://techsolve44.com/image-resize/',
  featureList: ['Resize by pixels or percentage', 'Maintains aspect ratio option', 'Browser-only processing', 'No file upload to server', 'Free, no account needed'],
};

export const metadata = toolMetadata('/image-resize/', {
  title: 'Image Resizer Free Online — Resize JPG PNG Without Losing Quality',
  description: 'Free online image resizer. Resize JPG, PNG and other images by pixels or percentage. No signup required. Files processed in your browser.',
  keywords: ['image resizer online free', 'resize image online free', 'resize jpg png free', 'image resize without quality loss', 'photo resizer online india', 'resize image kb free'],
  openGraph: {
    title: 'Image Resizer Free — Resize Images Online in Browser',
    description: 'Resize images online free. By pixels or percentage. No signup, no file upload.',
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

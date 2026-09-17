import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Image Compressor',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Compress JPG, PNG and WebP images free. Choose a quality level or aim for a target file size. Runs entirely in your browser — your images are never uploaded.',
  url: 'https://tools.decyfy.com/image-compress/',
  featureList: ['Quality or target-size modes', 'JPEG, PNG and WebP output', 'Optional dimension reduction', 'Before and after size comparison', 'Browser-only, no upload'],
};

export const metadata = toolMetadata('/image-compress/', {
  title: 'Compress Image Free Online — Reduce JPG, PNG & WebP Size',
  description: 'Compress JPG, PNG and WebP images free. Choose a quality level or aim for a target file size. Runs entirely in your browser — your images are never uploaded.',
  keywords: ['compress image online free', 'reduce image file size', 'compress jpg to 200kb', 'image compressor no upload', 'shrink photo size online', 'compress png free'],
  openGraph: {
    title: 'Free Image Compressor — Shrink Photos in Your Browser',
    description: 'Compress JPG, PNG or WebP to fit any upload limit. Free, private, nothing uploaded.',
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

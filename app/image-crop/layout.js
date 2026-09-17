import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Image Cropper',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Crop JPG, PNG and WebP images free. Drag freehand or lock to 1:1, 4:3, 16:9 and other common shapes. Runs entirely in your browser — your images are never uploaded.',
  url: 'https://tools.decyfy.com/image-crop/',
  featureList: ['Freeform and fixed-ratio cropping', 'Drag handles or type exact pixels', 'Square, 4:3, 3:2, 16:9, portrait and story shapes', 'Exact output dimensions shown', 'Browser-only, no upload'],
};

export const metadata = toolMetadata('/image-crop/', {
  title: 'Crop Image Free Online — Freeform & Fixed Aspect Ratios',
  description: 'Crop JPG, PNG and WebP images free. Drag freehand or lock to 1:1, 4:3, 16:9 and other common shapes. Runs entirely in your browser — your images are never uploaded.',
  keywords: ['crop image online free', 'crop photo to square', 'image cropper no upload', 'crop picture 16:9', 'crop image to passport size', 'free photo crop tool'],
  openGraph: {
    title: 'Free Image Cropper — Crop to Any Shape in Your Browser',
    description: 'Crop images freehand or to a fixed ratio. Free, no signup, nothing uploaded.',
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

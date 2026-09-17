import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free PDF Rotate Tool',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Rotate PDF pages free. Turn individual pages or the whole document, in either direction, and keep the text selectable. Runs in your browser — files are never uploaded.',
  url: 'https://tools.decyfy.com/pdf-rotate/',
  featureList: ['Rotate single pages or all pages', 'Clockwise and anti-clockwise', 'Different rotation per page', 'Text stays selectable, no rasterising', 'Browser-only, no upload'],
};

export const metadata = toolMetadata('/pdf-rotate/', {
  title: 'Rotate PDF Free Online — Fix Sideways Pages Permanently',
  description: 'Rotate PDF pages free. Turn individual pages or the whole document, in either direction, and keep the text selectable. Runs in your browser — files are never uploaded.',
  keywords: ['rotate pdf online free', 'rotate pdf pages and save', 'turn pdf page sideways', 'fix upside down pdf', 'rotate pdf permanently free', 'pdf rotate no upload'],
  openGraph: {
    title: 'Rotate PDF Free — Fix Sideways Pages in Your Browser',
    description: 'Rotate individual pages or the whole PDF and save it. Free, private, nothing uploaded.',
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

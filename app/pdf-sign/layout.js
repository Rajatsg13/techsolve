import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free PDF Signature Tool',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Add a visible signature to a PDF free. Type or draw your signature, place it anywhere, and download. Runs in your browser — your document is never uploaded.',
  url: 'https://tools.decyfy.com/pdf-sign/',
  featureList: ['Typed or hand-drawn signature', 'Drag to position and resize', 'Sign one page, several, or all', 'Document structure preserved', 'Browser-only, no upload'],
};

export const metadata = toolMetadata('/pdf-sign/', {
  title: 'Sign PDF Free Online — Add a Signature to Any PDF',
  description: 'Add a visible signature to a PDF free. Type or draw your signature, place it anywhere, and download. Runs in your browser — your document is never uploaded.',
  keywords: ['sign pdf online free', 'add signature to pdf', 'draw signature on pdf', 'esign pdf free', 'pdf signature no upload', 'sign document online free'],
  openGraph: {
    title: 'Sign PDF Free — Add Your Signature in the Browser',
    description: 'Type or draw a signature and place it on your PDF. Free, private, nothing uploaded.',
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

import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Organize PDF Online Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Reorder, rotate and delete PDF pages for free. Drag-and-drop page organizing that runs entirely in your browser — your files are never uploaded to a server.',
  url: 'https://techsolve44.com/pdf-organize/',
  featureList: ['Reorder PDF pages', 'Rotate pages', 'Delete pages', 'Drag-and-drop', 'Browser-only processing'],
};

export const metadata = toolMetadata('/pdf-organize/', {
  title: 'Organize PDF Free — Reorder, Rotate & Delete Pages',
  description: 'Rearrange, rotate and remove PDF pages for free. Drag to reorder — 100% private, everything runs in your browser. No signup, no upload.',
  keywords: ['organize pdf free', 'reorder pdf pages', 'rotate pdf pages', 'delete pdf pages', 'rearrange pdf online', 'pdf page organizer free'],
  openGraph: {
    title: 'Organize PDF Free — Reorder, Rotate & Delete Pages',
    description: 'Rearrange, rotate and remove PDF pages instantly. Free, private, runs in your browser.',
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

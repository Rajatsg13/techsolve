import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free PDF Redaction Tool',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Redact a PDF free so the hidden text is genuinely removed, not just covered. Redacted pages are rebuilt as images. Runs in your browser — files are never uploaded.',
  url: 'https://tools.decyfy.com/pdf-redact/',
  featureList: ['Content removed, not just covered', 'Multiple redactions per page', 'Redact across several pages', 'Untouched pages keep their text', 'Browser-only, no upload'],
};

export const metadata = toolMetadata('/pdf-redact/', {
  title: 'Redact PDF Free Online — Permanently Remove Sensitive Text',
  description: 'Redact a PDF free so the hidden text is genuinely removed, not just covered. Redacted pages are rebuilt as images. Runs in your browser — files are never uploaded.',
  keywords: ['redact pdf free', 'black out text in pdf permanently', 'remove sensitive data from pdf', 'pdf redaction tool free', 'redact pdf without upload', 'hide text in pdf securely'],
  openGraph: {
    title: 'Redact PDF Free — Genuinely Remove Text, Not Just Cover It',
    description: 'Redacted content is removed from the file, not hidden behind a box. Free, private, nothing uploaded.',
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

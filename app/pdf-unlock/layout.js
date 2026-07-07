import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Remove PDF Password Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Remove password protection from PDF files free online. Enter the password to unlock your PDF. All processing in your browser — files never uploaded.',
  url: 'https://techsolve44.com/pdf-unlock/',
  featureList: ['Remove PDF password protection', 'Unlock owner-restricted PDFs', 'Browser-only processing', 'No file upload to server', 'Free, no account needed'],
};

export const metadata = toolMetadata('/pdf-unlock/', {
  title: 'Remove PDF Password Free — Unlock Password Protected PDF Online',
  description: 'Remove password from PDF files free online. Unlock password-protected PDFs instantly. No signup, files processed in your browser — never uploaded.',
  keywords: ['remove pdf password free', 'unlock pdf free online', 'pdf password remover free', 'pdf unlocker online india', 'remove pdf password protection free', 'unlock protected pdf no signup'],
  openGraph: {
    title: 'Remove PDF Password Free — Unlock PDF Online',
    description: 'Unlock password-protected PDFs free. Files processed in browser, never uploaded.',
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

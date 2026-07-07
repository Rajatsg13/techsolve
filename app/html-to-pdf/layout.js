import { toolMetadata } from '../lib/toolMeta';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'HTML to PDF Converter Free',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Convert any HTML code or webpage URL to a PDF file — free, no signup. Paste HTML or enter a URL and download the PDF instantly.',
  url: 'https://techsolve44.com/html-to-pdf/',
  featureList: ['Convert HTML code to PDF', 'Convert URL to PDF', 'Instant download', 'No software installation', 'Free, no account needed'],
};

export const metadata = toolMetadata('/html-to-pdf/', {
  title: 'HTML to PDF Converter Free — Convert HTML or URL to PDF Online',
  description: 'Free HTML to PDF converter. Paste HTML code or enter a URL to convert to PDF instantly. No signup, no software install. Works in your browser.',
  keywords: ['html to pdf converter free', 'html to pdf online', 'convert url to pdf free', 'webpage to pdf converter', 'html to pdf no signup', 'online html to pdf india'],
  openGraph: {
    title: 'HTML to PDF Free — Convert HTML or URL to PDF Online',
    description: 'Convert any HTML or webpage URL to PDF. Free, no signup, instant download.',
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

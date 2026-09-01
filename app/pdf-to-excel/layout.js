import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free PDF to Excel Converter',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Convert tables in a digitally generated PDF into a real .xlsx workbook free. Each table becomes a sheet. Runs in your browser — your document is never uploaded.',
  url: 'https://tools.decyfy.com/pdf-to-excel/',
  featureList: ['Real .xlsx output', 'One sheet per table', 'Joins tables split across pages', 'Numbers stay numbers', 'Browser-only, no upload'],
};

export const metadata = toolMetadata('/pdf-to-excel/', {
  title: 'PDF to Excel Free Online — Convert PDF Tables to XLSX',
  description: 'Convert tables in a digitally generated PDF into a real .xlsx workbook free. Each table becomes a sheet. Runs in your browser — your document is never uploaded.',
  keywords: ['pdf to excel free', 'convert pdf table to excel', 'pdf to xlsx converter', 'extract table from pdf', 'pdf to spreadsheet free', 'pdf to excel no upload'],
  openGraph: {
    title: 'Free PDF to Excel — Turn PDF Tables into a Spreadsheet',
    description: 'Extract tables from a digital PDF into an editable .xlsx. Free, private, nothing uploaded.',
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

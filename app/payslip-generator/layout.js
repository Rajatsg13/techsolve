import { toolMetadata } from '../lib/toolMeta';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Payslip Generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  description: 'Create a clear salary slip PDF free. Enter earnings and deductions and download a professional payslip. Runs entirely in your browser — salary details are never uploaded.',
  url: 'https://tools.decyfy.com/payslip-generator/',
  featureList: ['Custom earnings and deductions', 'Automatic gross and net pay', 'Net pay in words', 'Attendance and paid days', 'Instant PDF download', 'Browser-only, no upload'],
};

export const metadata = toolMetadata('/payslip-generator/', {
  title: 'Free Payslip Generator — Create a Salary Slip PDF Online',
  description: 'Create a clear salary slip PDF free. Enter earnings and deductions and download a professional payslip. Runs entirely in your browser — salary details are never uploaded.',
  keywords: ['free payslip generator', 'salary slip format pdf', 'payslip generator india', 'create salary slip online', 'salary slip maker free', 'payslip template pdf'],
  openGraph: {
    title: 'Free Payslip Generator — Salary Slip PDFs in Seconds',
    description: 'Generate a professional salary slip PDF in your browser. Free, private, no signup.',
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

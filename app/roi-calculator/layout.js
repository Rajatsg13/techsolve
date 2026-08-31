import { toolMetadata } from '../lib/toolMeta';

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ROI Calculator",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Calculate return on investment for a business spend, with an annualised rate so returns over different periods compare fairly.",
  "url": "https://tools.decyfy.com/roi-calculator/",
  "featureList": [
    "ROI percentage and net gain",
    "Annualised return over a period",
    "Handles losses",
    "Formula shown"
  ]
};

export const metadata = toolMetadata('/roi-calculator/', {
  title: "ROI Calculator — Return on Investment with Annualised Rate",
  description: "Calculate return on investment for a business spend, with an annualised rate so returns over different periods compare fairly.",
  keywords: ["roi calculator", "return on investment", "annualised return calculator", "marketing roi"],
  openGraph: {
    title: "ROI Calculator — With Annualised Return",
    description: "Return on a business spend, plus the annualised rate.",
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

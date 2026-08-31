import { toolMetadata } from '../lib/toolMeta';

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Working Days Calculator",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Count working days between two dates. Configurable working week, optional holiday list, and inclusive or exclusive end date.",
  "url": "https://tools.decyfy.com/working-days-calculator/",
  "featureList": [
    "Configurable working week",
    "Holiday exclusions",
    "Inclusive or exclusive end date",
    "Daylight-saving safe date handling"
  ]
};

export const metadata = toolMetadata('/working-days-calculator/', {
  title: "Working Days Calculator — Business Days Between Dates",
  description: "Count working days between two dates. Configurable working week, optional holiday list, and inclusive or exclusive end date.",
  keywords: ["working days calculator", "business days calculator", "days between dates", "working days between two dates"],
  openGraph: {
    title: "Working Days Calculator",
    description: "Business days between two dates, minus weekends and holidays.",
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

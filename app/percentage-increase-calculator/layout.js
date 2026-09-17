import { toolMetadata } from '../lib/toolMeta';

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Percentage Increase Calculator",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Work out the percentage increase or decrease between two values, with the absolute change alongside it.",
  "url": "https://tools.decyfy.com/percentage-increase-calculator/",
  "featureList": [
    "Increase and decrease",
    "Absolute and percentage change",
    "Handles negative starting values",
    "Formula shown"
  ]
};

export const metadata = toolMetadata('/percentage-increase-calculator/', {
  title: "Percentage Increase Calculator — Change Between Two Numbers",
  description: "Work out the percentage increase or decrease between two values, with the absolute change alongside it.",
  keywords: ["percentage increase calculator", "percent change", "percentage decrease", "growth percentage"],
  openGraph: {
    title: "Percentage Increase Calculator",
    description: "The percentage change between two numbers, increase or decrease.",
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

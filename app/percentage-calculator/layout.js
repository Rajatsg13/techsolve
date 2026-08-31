import { toolMetadata } from '../lib/toolMeta';

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Percentage Calculator",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Calculate a percentage of a value, what share one number is of another, or a value after adding or removing a percentage.",
  "url": "https://tools.decyfy.com/percentage-calculator/",
  "featureList": [
    "Percentage of a value",
    "X is what percent of Y",
    "Add or remove a percentage",
    "Formula shown for every result"
  ]
};

export const metadata = toolMetadata('/percentage-calculator/', {
  title: "Percentage Calculator — Free Online Percentage Tool",
  description: "Calculate a percentage of a value, what share one number is of another, or a value after adding or removing a percentage.",
  keywords: ["percentage calculator", "percent of a number", "what percent is", "calculate percentage online"],
  openGraph: {
    title: "Percentage Calculator — Free and Instant",
    description: "Three common percentage calculations, with the formula shown.",
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

import { toolMetadata } from '../lib/toolMeta';

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Profit Margin Calculator",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Calculate profit margin and markup from cost and selling price, or find the price needed to hit a target margin.",
  "url": "https://tools.decyfy.com/profit-margin-calculator/",
  "featureList": [
    "Margin and markup together",
    "Target margin pricing",
    "Handles loss-making sales",
    "Formula shown"
  ]
};

export const metadata = toolMetadata('/profit-margin-calculator/', {
  title: "Profit Margin Calculator — Margin and Markup",
  description: "Calculate profit margin and markup from cost and selling price, or find the price needed to hit a target margin.",
  keywords: ["profit margin calculator", "markup calculator", "margin vs markup", "gross margin calculator", "selling price calculator"],
  openGraph: {
    title: "Profit Margin Calculator — Margin vs Markup",
    description: "Margin, markup and the price required for a target margin.",
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

import { toolMetadata } from '../lib/toolMeta';

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Salary Hike Calculator",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Turn a salary hike percentage into a real figure, or work out the percentage that a new offer represents.",
  "url": "https://tools.decyfy.com/salary-hike-calculator/",
  "featureList": [
    "New salary from a hike percentage",
    "Hike percentage from two salaries",
    "Monthly difference",
    "Identifies a pay cut"
  ]
};

export const metadata = toolMetadata('/salary-hike-calculator/', {
  title: "Salary Hike Calculator — Percentage and New Salary",
  description: "Turn a salary hike percentage into a real figure, or work out the percentage that a new offer represents.",
  keywords: ["salary hike calculator", "salary increment calculator", "hike percentage calculator", "new salary after hike"],
  openGraph: {
    title: "Salary Hike Calculator",
    description: "What a hike percentage is worth, and what percentage an offer really is.",
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

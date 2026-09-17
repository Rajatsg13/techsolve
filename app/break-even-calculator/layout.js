import { toolMetadata } from '../lib/toolMeta';

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Break-even Calculator",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Find the break-even point in units and revenue from fixed costs, selling price and variable cost per unit.",
  "url": "https://tools.decyfy.com/break-even-calculator/",
  "featureList": [
    "Break-even in units and revenue",
    "Contribution per unit and margin",
    "Units for a target profit",
    "Warns when a price can never break even"
  ]
};

export const metadata = toolMetadata('/break-even-calculator/', {
  title: "Break-even Calculator — Units and Revenue",
  description: "Find the break-even point in units and revenue from fixed costs, selling price and variable cost per unit.",
  keywords: ["break even calculator", "break even point", "contribution margin calculator", "break even analysis"],
  openGraph: {
    title: "Break-even Calculator",
    description: "How many units you need to sell before you make a profit.",
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

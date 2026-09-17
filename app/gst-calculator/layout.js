import { toolMetadata } from '../lib/toolMeta';

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "GST Calculator",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Add GST to a price or extract GST from an inclusive amount. Shows CGST, SGST and IGST splits at 5, 12, 18 and 28 percent.",
  "url": "https://tools.decyfy.com/gst-calculator/",
  "featureList": [
    "Add GST to a net amount",
    "Extract GST from an inclusive amount",
    "CGST and SGST split",
    "IGST for inter-state supply",
    "Standard and custom rates"
  ]
};

export const metadata = toolMetadata('/gst-calculator/', {
  title: "GST Calculator — Add or Remove GST Online",
  description: "Add GST to a price or extract GST from an inclusive amount. Shows CGST, SGST and IGST splits at 5, 12, 18 and 28 percent.",
  keywords: ["gst calculator", "add gst", "remove gst", "gst inclusive calculator", "cgst sgst calculator", "igst calculator"],
  openGraph: {
    title: "GST Calculator — Add or Remove GST",
    description: "GST-inclusive and exclusive calculations with CGST, SGST and IGST splits.",
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

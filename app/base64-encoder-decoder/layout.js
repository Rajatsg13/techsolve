import { toolMetadata } from '../lib/toolMeta';

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Base64 Encoder and Decoder",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Encode text to Base64 or decode it back, with full UTF-8 support and URL-safe output. Runs in your browser.",
  "url": "https://tools.decyfy.com/base64-encoder-decoder/",
  "featureList": [
    "Encode and decode",
    "Full UTF-8 support",
    "URL-safe variant",
    "Clear errors for invalid Base64",
    "Runs entirely in the browser"
  ]
};

export const metadata = toolMetadata('/base64-encoder-decoder/', {
  title: "Base64 Encoder & Decoder — Free Online Tool",
  description: "Encode text to Base64 or decode it back, with full UTF-8 support and URL-safe output. Runs in your browser.",
  keywords: ["base64 encoder", "base64 decoder", "encode base64 online", "decode base64", "base64 utf-8"],
  openGraph: {
    title: "Base64 Encoder & Decoder — Free, No Upload",
    description: "Convert text to Base64 and back, including accented and non-Latin characters.",
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

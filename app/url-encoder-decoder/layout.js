import { toolMetadata } from '../lib/toolMeta';

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "URL Encoder and Decoder",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Percent-encode text for a URL or decode an encoded URL back to readable text, with a query-parameter breakdown.",
  "url": "https://tools.decyfy.com/url-encoder-decoder/",
  "featureList": [
    "Encode and decode",
    "Component or whole-URL scope",
    "Query parameter breakdown",
    "Explains malformed escapes",
    "Runs entirely in the browser"
  ]
};

export const metadata = toolMetadata('/url-encoder-decoder/', {
  title: "URL Encoder & Decoder — Percent Encoding Tool",
  description: "Percent-encode text for a URL or decode an encoded URL back to readable text, with a query-parameter breakdown.",
  keywords: ["url encoder", "url decoder", "percent encoding", "encode url online", "decode url"],
  openGraph: {
    title: "URL Encoder & Decoder — Free, No Upload",
    description: "Encode text for links, or decode a URL to read what it actually says.",
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

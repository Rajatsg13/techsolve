import { toolMetadata } from '../lib/toolMeta';

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "JSON Formatter and Validator",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "description": "Format, minify and validate JSON in your browser. Precise line-and-column error messages. Nothing is uploaded.",
  "url": "https://tools.decyfy.com/json-formatter/",
  "featureList": [
    "Format with 2, 4 or tab indent",
    "Minify",
    "Validate only",
    "Line and column error reporting",
    "Runs entirely in the browser"
  ]
};

export const metadata = toolMetadata('/json-formatter/', {
  title: "JSON Formatter & Validator — Free Online JSON Beautifier",
  description: "Format, minify and validate JSON in your browser. Precise line-and-column error messages. Nothing is uploaded.",
  keywords: ["json formatter", "json validator", "json beautifier", "json minify", "format json online", "json syntax error"],
  openGraph: {
    title: "JSON Formatter & Validator — Free, No Upload",
    description: "Beautify, minify or validate JSON with exact error locations.",
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

export const metadata = {
  alternates: { canonical: '/about/' },
  title: 'About Us — TechSolve44',
  description: 'Learn about TechSolve44 — a free online tools platform for PDF conversion, financial calculators, image tools and more.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">About TechSolve44</h1>
      <p className="text-slate-500 mb-8">Free tools for everyone. Built with ❤️ in India.</p>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed">
        <p>
          TechSolve44 is a free online tools platform designed to make everyday digital tasks simpler for everyone.
          Whether you need to convert a PDF, calculate your home loan EMI, plan your SIP investments, or resize an image
          for a government application — we've built a tool for it.
        </p>
        <p>
          All our tools run directly in your browser. This means your files and data <strong>never leave your device</strong> —
          we don't store, read, or process anything on a server. It's fast, private, and completely free.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Our Mission</h2>
        <p>
          To build the most useful, fastest, and most privacy-respecting free tool website on the internet —
          with a special focus on tools that matter to Indian users: government form helpers, financial calculators
          with Indian-specific tax rules, and document tools that work with Indian formats.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">What We Offer</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>PDF Tools: convert, merge, compress, and split PDF files</li>
          <li>Financial Calculators: EMI, SIP, PPF, Lumpsum, Income Tax</li>
          <li>Image Tools: resize for government portals, compress, convert</li>
          <li>Developer Tools: JSON validator, Base64 encoder, URL encoder (coming soon)</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Contact Us</h2>
        <p>Have a suggestion for a new tool? Found a bug? We'd love to hear from you. Visit our <a href="/contact" className="text-brand-700 underline">Contact page</a>.</p>
      </div>
    </div>
  );
}

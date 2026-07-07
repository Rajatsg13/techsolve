export const metadata = {
  alternates: { canonical: '/privacy-policy/' },
  title: 'Privacy Policy — TechSolve44',
  description: 'Privacy policy for TechSolve44, a division of GDB Advisories LLP — how we handle your data (spoiler: we don\'t collect any).',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Privacy Policy</h1>
      <p className="text-slate-400 text-sm mb-8">Last updated: June 2026</p>

      <div className="space-y-8 text-slate-700 leading-relaxed text-sm">
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">1. Overview</h2>
          <p>TechSolve44 is a division of <strong>GDB Advisories LLP</strong> ("GDB Advisories", "we", "us", "our"), which owns and operates the website techsolve44.com. This Privacy Policy explains how TechSolve44 and GDB Advisories LLP collect, use, and protect any information you provide when using our tools.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">2. Files and Data</h2>
          <p>All tools on TechSolve44 run entirely in your browser. <strong>TechSolve44 and GDB Advisories LLP do not upload, store, or process your files on any server.</strong> Your documents, images, and data never leave your device. Processing happens locally using JavaScript.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">3. Cookies and Analytics</h2>
          <p>We use Google Analytics to understand how visitors use our site (page views, tool usage, device types). This data is anonymous and aggregated. We do not use cookies for advertising tracking beyond what Google Analytics sets. You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" className="text-brand-700 underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">4. Google AdSense</h2>
          <p>We display advertisements provided by Google AdSense. Google may use cookies to serve ads based on your interests. For more information, see <a href="https://policies.google.com/privacy" className="text-brand-700 underline" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>. You can opt out of personalised ads via <a href="https://www.google.com/settings/ads" className="text-brand-700 underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">5. Contact Forms</h2>
          <p>If you submit our contact form, we collect your name, email address, and message solely to respond to your enquiry. This information is not shared with third parties.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">6. Children's Privacy</h2>
          <p>Our services are not directed at children under 13. We do not knowingly collect personal information from children.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">7. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">8. Contact</h2>
          <p>If you have questions about this Privacy Policy, please <a href="/contact" className="text-brand-700 underline">contact us</a>. TechSolve44 is a division of GDB Advisories LLP.</p>
        </section>
      </div>
    </div>
  );
}

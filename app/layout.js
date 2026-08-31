import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import FeedbackWidget from './components/FeedbackWidget';
import ShareBar from './components/ShareBar';

export const metadata = {
  // Live origin. techsolve44.com 308-redirects here, so canonicals and social
  // cards must reference this host, not the old one.
  metadataBase: new URL('https://tools.decyfy.com'),
  title: {
    default: 'Tools by Decyfy — Free Online Tools for Everyday Work',
    template: '%s | Tools by Decyfy',
  },
  description: 'Free browser-based tools for everyday document and file work — merge, split, compress and convert PDFs, run OCR, resize images. No sign-up, and your files never leave your device.',
  keywords: ['online pdf tools', 'merge pdf', 'split pdf', 'compress pdf', 'pdf to word', 'ocr pdf', 'image resizer', 'free document tools', 'browser based tools'],
  authors: [{ name: 'Decyfy' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://tools.decyfy.com',
    siteName: 'Tools by Decyfy',
    title: 'Tools by Decyfy — Free Online Tools for Everyday Work',
    description: 'Simple, free online tools for documents, files and images. No sign-up, no downloads — just open and use.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Tools by Decyfy — free online tools for documents, files and images' }],
  },
  twitter: { card: 'summary_large_image', title: 'Tools by Decyfy — Free Online Tools for Everyday Work', description: 'Simple, free online tools for documents, files and images. No sign-up, no downloads — just open and use.', images: ['/og-image.png'] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-4494437609747723" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          as="style"
          id="font-preload"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.getElementById('font-preload').onload=function(){this.onload=null;this.rel='stylesheet'};`,
          }}
        />
        <noscript>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" />
        </noscript>
      </head>
      <body className="flex flex-col min-h-screen bg-[#f7f9fc]">
        <Header />
        <main className="flex-1">{children}</main>
        {/* ShareBar and FeedbackWidget are mounted here so they render on every
            route exactly once — never add either inside a page, which would
            double them up. */}
        <ShareBar />
        <FeedbackWidget />
        <Footer />
        {/* Google Analytics — deferred until after page content */}
        <script defer src="https://www.googletagmanager.com/gtag/js?id=G-FFVH7DK4LD"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-FFVH7DK4LD');
        `}} />
      </body>
    </html>
  );
}

import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata = {
  metadataBase: new URL('https://techsolve44.com'),
  title: {
    default: 'TechSolve44 — Free Online Tools',
    template: '%s | TechSolve44',
  },
  description: '22+ free online tools for India — PDF merge, split & compress, EMI calculator, SIP calculator, income tax calculator, image resizer and more. No login. No data stored.',
  keywords: ['free online tools india', 'pdf converter', 'emi calculator', 'sip calculator', 'income tax calculator', 'image resizer', 'fire calculator', 'sharpe ratio calculator', 'graham number calculator'],
  authors: [{ name: 'TechSolve44' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://techsolve44.com',
    siteName: 'TechSolve44',
    title: 'TechSolve44 — Free Online Tools for India',
    description: '22+ free browser-based tools. PDF, calculators, image tools — no login, no data stored.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'TechSolve44 — Free Online Tools for India' }],
  },
  twitter: { card: 'summary_large_image', title: 'TechSolve44 — Free Online Tools for India', description: '22+ free tools. No login. No data stored.', images: ['/og-image.jpg'] },
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          as="style"
          id="font-preload"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.getElementById('font-preload').onload=function(){this.onload=null;this.rel='stylesheet'};`,
          }}
        />
        <noscript>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" />
        </noscript>
      </head>
      <body className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-1">{children}</main>
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

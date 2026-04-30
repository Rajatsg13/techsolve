import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata = {
  metadataBase: new URL('https://techsolve44.com'),
  title: {
    default: 'TechSolve44 — Free Online Tools',
    template: '%s | TechSolve44',
  },
  description: 'Free online tools for everyone — PDF converter, EMI calculator, SIP calculator, image resizer, JSON validator and more. No login required.',
  keywords: ['free online tools', 'pdf converter', 'emi calculator', 'sip calculator', 'image resizer', 'json validator'],
  authors: [{ name: 'TechSolve44' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://techsolve44.com',
    siteName: 'TechSolve44',
    title: 'TechSolve44 — Free Online Tools',
    description: 'Free browser-based tools. PDF, calculators, image tools, developer utilities — all in one place.',
  },
  twitter: { card: 'summary_large_image', title: 'TechSolve44 — Free Online Tools' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

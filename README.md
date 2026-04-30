# TechSolve44 — Next.js Project

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run locally
npm run dev
# Open http://localhost:3000

# 3. Build for production
npm run build
npm start
```

## Deploy to Vercel (Free)

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Vercel auto-detects Next.js — click Deploy
4. Add your custom domain techsolve44.com in Vercel settings

## Tier 1 Tools Included

### Financial Calculators
- `/emi-calculator` — Home/car/personal loan EMI
- `/sip-calculator` — Monthly SIP returns
- `/lumpsum-calculator` — One-time investment returns
- `/ppf-calculator` — PPF maturity calculator
- `/income-tax-calculator` — FY 2024-25, New + Old regime

### PDF Tools
- `/image-to-pdf` — JPG/PNG to PDF (browser-based)
- `/pdf-merge` — Combine multiple PDFs
- `/pdf-compress` — Reduce PDF size
- `/pdf-to-word` — Extract text from PDF into .docx
- `/word-to-pdf` — Convert .docx to PDF

### Supporting Pages
- `/about` — About page (required for AdSense)
- `/contact` — Contact form
- `/privacy-policy` — Privacy policy (required for AdSense)

## AdSense Setup

Replace the `[ AdSense — ... ]` placeholder divs in each page with your actual AdSense ad unit code:

```jsx
// Replace this:
<div className="ad-slot h-24">[ AdSense — Leaderboard ]</div>

// With this (your actual ad unit):
<ins className="adsbygoogle"
  style={{ display: 'block' }}
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
  data-ad-slot="XXXXXXXXXX"
  data-ad-format="auto">
</ins>
```

## Adding More Tools (Tier 2)

Each new tool = one new folder under `app/`:
1. Create `app/tool-name/page.js`
2. Add it to the homepage grid in `app/page.js`
3. Add it to the Header and Footer links

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- pdf-lib (PDF operations)
- mammoth (Word reading)
- docx (Word generation)
- Recharts (charts in calculators)

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # local dev server at http://localhost:3000
npm run build      # static export → out/
npm run lint       # ESLint via next lint
```

Tests live in a separate package under `test-harness/`:

```bash
cd test-harness
npm install && npm run setup   # setup installs the Chromium binary
npm test                       # everything
npm run test:calc              # calculators only (@calc)
npm run test:pages             # page-load checks only (@pages)
npm run test:pdf               # PDF tools only (@pdf)
```

The project is configured for **static export** (`output: 'export'` in `next.config.mjs`). There is no server runtime — `npm run build` produces a fully static `out/` folder that can be dropped directly into Hostinger's `public_html`.

## Architecture

**Next.js 14 App Router** with static export. Every page is a React Client Component (`'use client'`) because all processing runs in the user's browser — no API routes, no server components that do real work.

**All tool logic is browser-only.** PDF operations use `pdf-lib` imported dynamically inside event handlers (`await import('pdf-lib')`). Word conversion uses `mammoth`/`docx`. Charts use `recharts`. Files never leave the device.

### Routing & file structure

Each tool lives in `app/<tool-name>/page.js`. Adding a new tool requires:
1. `app/<tool-name>/page.js` — the page component
2. `app/<tool-name>/layout.js` — per-tool SEO metadata via `toolMetadata()` plus the `SoftwareApplication` JSON-LD block
3. Entry in the homepage grid (`app/page.js` — the relevant `pdfTools`, `imageTools`, or `calculators` array)
4. Entry in `Header.js` (`navGroups`) and `Footer.js`
5. A `<loc>` in `public/sitemap.xml` (trailing slash — `trailingSlash: true` means `/tool/` is the real URL)
6. Slug in `app/lib/crossBrandConfig.js` `PAGE_BRAND_MAP` if the tool should carry a cross-brand card
7. Entries in `test-harness/tests/pages.spec.js` (`TOOL_PAGES`) and, for calculators, `tests/calculators.spec.js`

`toolMetadata()` in `app/lib/toolMeta.js` exists because Next.js merges `openGraph`/`twitter` *shallowly* across the layout tree — a tool that declares its own `openGraph` replaces the root's rather than merging, silently dropping the OG image. Always go through the helper.

### Shared components (`app/components/`)

- **Header.js** — sticky nav with hover dropdowns (desktop) and accordion (mobile). `navGroups` array is the single source of truth for nav links.
- **Footer.js** — four-column footer with hardcoded link lists.
- **ToolCard.js** — card used on homepage grid, accepts `{ icon, title, description, href, badge }`.

### Global CSS utilities (`app/globals.css`)

Custom classes used across all tool pages:
- `.tool-container` — max-width wrapper with padding for tool pages
- `.drop-zone` / `.drop-zone.active` — drag-and-drop file upload area
- `.ad-slot` — placeholder div for AdSense ad units (replace with `<ins>` tags)
- `.faq-item` — styled `<details>`/`<summary>` accordion

### Design system

Tailwind with a custom `brand` color scale (blue, defined in `tailwind.config.js`). Font: Inter. The `brand-700` / `brand-800` pair is the primary CTA color throughout.

### Key config

- `next.config.mjs`: `output: 'export'`, `trailingSlash: true`, `generateBuildId: () => 'ts44'` (keeps static asset paths stable across deploys), `images: { unoptimized: true }`, webpack `fs/net/tls/canvas` fallbacks set to `false` for browser-only packages.
- Domain: `https://techsolve44.com`
- Analytics: Google Analytics `G-FFVH7DK4LD` in `app/layout.js`

### AdSense

The site uses **Auto Ads**, not manual placements — the old `.ad-slot` placeholder divs have been removed from the tool pages. The publisher meta tag (`ca-pub-4494437609747723`) is in `app/layout.js`. Once the account is approved, Auto Ads are switched on from the AdSense dashboard; no code change is needed.

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main`: it builds on GitHub Actions and FTPs `out/` to Hostinger `public_html/`. There is no manual upload step and no `site_files/` directory any more.

Two things worth knowing:

- **The FTP step is conditional** — `if: ${{ env.FTP_HOST != '' }}`. If the FTP secrets are ever missing the run still goes green *without deploying*. A passing check is not proof the site updated; verify against the live URL.
- **`dangerous-clean-slate: false`** — files not in the build are never deleted server-side. This protects `ads.txt` and Search Console verification files, but it also means old hashed CSS/JS accumulate rather than being cleaned up.

The build ID is pinned to `ts44`, so `_next/static/ts44/` paths are stable. The **CSS filename hash is not stable** — it changes whenever styles change. Nothing should ever hardcode it.

## Tool pattern

Every tool page follows the same structure:
1. `'use client'` directive
2. Local state for files/inputs, loading, errors
3. Drag-and-drop + file `<input>` for file tools; numeric inputs for calculators
4. Processing triggered by a button, runs entirely in the browser
5. Result downloaded via `URL.createObjectURL` / `file-saver` or displayed inline
6. FAQ `<details>` accordion at the bottom, using `.faq-item`

Conventions worth matching:

- **Currency formatting** is a local `const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN')` per page, not a shared import. Follow the local pattern.
- **Never add `export const metadata`** to a tool `page.js` — they are all `'use client'` and it is a webpack build error. Metadata goes in the sibling `layout.js`.
- **Pair every `<label>` with its input** via `htmlFor`/`id`. Sibling-only labels are not announced by screen readers, and `getByLabel` in the tests will not resolve them.

## Financial tools

The calculators encode tax rules that change with each Budget. Current basis (FY 2025-26, post Finance Act 2024):

- **Listed equity** — LTCG above 12 months at 12.5% on gains over the ₹1.25 lakh annual exemption; STCG at a flat 20%.
- **Equity mutual funds** — same as listed equity.
- **Debt / non-equity funds** — long-term threshold is **24 months** (cut from 36 by the Finance Act 2024 for transfers on or after 23 July 2024), LTCG at 12.5% with no indexation; short-term added to income and taxed at slab.
- Surcharge and the 4% health & education cess are **not** modelled anywhere.

`/mf-profit-calculator` calls **MFapi.in** (`api.mfapi.in`, no auth, permissive CORS) for scheme search and NAV history. It returns dates as `DD-MM-YYYY`, which `Date.parse` cannot read — parse manually. NAV lookups resolve to the most recent value **on or before** the requested date, since funds publish nothing on weekends and holidays. Asset class is guessed from `meta.scheme_category` and is user-overridable.

MFapi's `/mf/search` endpoint caps at **15 unranked rows**, which buries obvious matches — `?q=HDFC` never returns HDFC Flexi Cap. The page therefore fetches the full `/mf` catalogue once (~37k schemes, ~470 KB gzipped) on first interaction and ranks locally. Do not "simplify" this back to the search endpoint.

## Runtime network dependencies

Tool logic runs in the browser, but **six pages fetch from the network at runtime** — worth knowing before claiming the site is fully offline-capable:

| Page | Host | What |
|---|---|---|
| `mf-profit-calculator` | `api.mfapi.in` | Scheme catalogue + NAV history |
| `pdf-compress` | `cdn.jsdelivr.net` | `mupdf@1.26.4` |
| `pdf-to-word` | `cdnjs.cloudflare.com` | `pdf.js@3.11.174` + worker |
| `pdf-ocr` | `unpkg.com` | pdf.js worker (version from bundled `pdfjs-dist`) |
| `pdf-to-jpg` | `unpkg.com` | pdf.js worker (same) |
| `html-to-pdf` | `cdnjs.cloudflare.com` | `html2pdf@0.10.1` |

The unpkg URLs interpolate `pdfjsLib.version`, so they track whatever `pdfjs-dist` is installed (currently 3.11.174) — bumping that package silently changes the fetched worker URL. All other tools are genuinely local-only.

## Static export and time

Pages are pre-rendered at build time, so **anything derived from the current date must be resolved after mount**, not during render. Calling a `today()` helper inline bakes the build date into the HTML, and React does not patch the attribute on hydration — a `max` on a date input then caps at a date in the past and the browser marks the field invalid. Use `useState('')` + `useEffect`, and treat the empty first-render value as "no constraint yet".

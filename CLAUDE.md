# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # local dev server at http://localhost:3000
npm run build      # static export → out/
npm run lint       # ESLint via next lint
```

The project is configured for **static export** (`output: 'export'` in `next.config.mjs`). There is no server runtime — `npm run build` produces a fully static `out/` folder that can be dropped directly into Hostinger's `public_html`.

## Architecture

**Next.js 14 App Router** with static export. Every page is a React Client Component (`'use client'`) because all processing runs in the user's browser — no API routes, no server components that do real work.

**All tool logic is browser-only.** PDF operations use `pdf-lib` imported dynamically inside event handlers (`await import('pdf-lib')`). Word conversion uses `mammoth`/`docx`. Charts use `recharts`. Files never leave the device.

### Routing & file structure

Each tool lives in `app/<tool-name>/page.js`. Adding a new tool requires:
1. `app/<tool-name>/page.js` — the page component
2. Entry in the homepage grid (`app/page.js` — the relevant `pdfTools`, `imageTools`, or `calculators` array)
3. Entry in `Header.js` (`navGroups`) and `Footer.js`

Some tools also have `app/<tool-name>/layout.js` for per-tool metadata.

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

Replace `.ad-slot` placeholder divs with actual `<ins class="adsbygoogle" ...>` tags. Publisher ID goes in each tag and in `_document` / layout meta as needed.

## Tool pattern

Every tool page follows the same structure:
1. `'use client'` directive
2. Local state for files/inputs, loading, errors
3. Drag-and-drop + file `<input>` for file tools; numeric inputs for calculators
4. Processing triggered by a button, runs entirely in the browser
5. Result downloaded via `URL.createObjectURL` / `file-saver` or displayed inline
6. How-to steps section + FAQ `<details>` accordion at the bottom
7. `.ad-slot` divs before and after the main content

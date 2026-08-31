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

The project is configured for **static export** (`output: 'export'` in `next.config.mjs`). There is no server runtime — `npm run build` produces a fully static `out/` folder. That folder is what Vercel serves; the `output: 'export'` / `trailingSlash` / `images.unoptimized` trio dates from the earlier Hostinger deployment and is retained deliberately so existing URLs do not move.

## Architecture

**Next.js 14 App Router** with static export. Every page is a React Client Component (`'use client'`) because all processing runs in the user's browser — no API routes, no server components that do real work.

**All tool logic is browser-only.** PDF operations use `pdf-lib` imported dynamically inside event handlers (`await import('pdf-lib')`). Word conversion uses `mammoth`/`docx`. Charts use `recharts`. Files never leave the device.

### Routing & file structure

Each tool lives in `app/<tool-name>/page.js`. Adding a new tool requires:
1. **Build the tool** — `app/<tool-name>/page.js` and `app/<tool-name>/layout.js` (SEO metadata via `toolMetadata()` plus the `SoftwareApplication` JSON-LD block).
2. **An entry in `app/lib/tools.js`** — the central registry. Assign a `category` from the five-category taxonomy and `status: STATUS.ACTIVE`. This one entry feeds the homepage grid, the header navigation and the sitemap.
3. **Optionally, rich content** in `app/content/tools/<slug>.js`.
4. Optional: slug in `app/lib/crossBrandConfig.js` `PAGE_BRAND_MAP` if the tool should carry a cross-brand card
5. Optional: entry in `Footer.js`, which shows a hand-picked shortlist rather than the full catalogue
6. Entries in `test-harness/tests/pages.spec.js` (`TOOL_PAGES`) and, for calculators, `tests/calculators.spec.js`

Steps 1–3 are the required ones. Homepage, navigation and sitemap all derive from step 1 — never hand-edit a tool list in those files again.

Rich page content is separate and optional — see **Tool page content** below.

`toolMetadata()` in `app/lib/toolMeta.js` exists because Next.js merges `openGraph`/`twitter` *shallowly* across the layout tree — a tool that declares its own `openGraph` replaces the root's rather than merging, silently dropping the OG image. Always go through the helper.

### Central tool registry (`app/lib/tools.js`)

`app/lib/tools.js` is the single source of truth for the tool catalogue. It exports `TOOLS` (one entry per tool), `CATEGORY_META`, `SUPPORT_PAGES` and a set of selectors.

Consumed by:
- `app/page.js` — via `getHomepageSections()`
- `app/components/Header.js` — via `getNavigationGroups()`
- `app/sitemap.js` — via `TOOLS` + `SUPPORT_PAGES`

**Product taxonomy.** Five public categories, defined in `CATEGORY_META`:

| Order | Category | Description | ACTIVE tools |
|---|---|---|---|
| 1 | **Documents & PDF** | Work with PDFs, documents and everyday file tasks. | 12 |
| 2 | **File & Image** | Convert, resize and manage images and common files. | 3 |
| 3 | **Data & Text** | Format, convert and work with structured data and text. | 0 |
| 4 | **Business & Work** | Practical calculators and utilities for everyday work decisions. | 0 |
| 5 | **Generators** | Create commonly used business and personal documents. | 0 |

Plus one legacy category, `finance` (`legacy: true`), which the FinLearn tools still reference. It is kept out of public surfaces by **status**, not by category.

The last three categories have no tools yet. They are defined so the taxonomy is ready, and the selectors drop empty categories, so they never render as empty headings. **Do not add placeholder or "coming soon" entries** — the live catalogue contains only tools that actually work. Planned tools belong in documentation, not in the registry.

**Classification principle.** Tools are filed by **the artefact the user starts with**, not the one they end up with:

- Holding a PDF or a document -> **Documents & PDF** (this includes Word to PDF and HTML to PDF: the split is documents vs images, not PDF vs non-PDF)
- Holding images or photos -> **File & Image** (Image to PDF, Image Resizer, Scan to PDF)

People browse by what they have in hand, and every planned File & Image tool is image-in. `PDF to JPG` is filed under Documents because the input is a PDF. Image to PDF and Scan to PDF are the genuinely arguable cases — see the note in `app/lib/tools.js`. Reclassifying one is a single-field edit.

**Tool status.** Every entry carries a `status`:

| Status | Meaning |
|---|---|
| `ACTIVE` | The public catalogue. Appears on the homepage, in the navigation, and in related-tool recommendations. |
| `LEGACY_FINANCE` | The 10 finance/investment calculators. Routes keep working, pages stay in the sitemap and remain linked from the footer — but they are **excluded from the primary discovery surfaces**. Candidates to move to a separate FinLearn product. |

**The discovery rule lives in the registry selectors, nowhere else.** `getHomepageSections()`, `getNavigationGroups()` and `getToolsByCategory()` exclude `LEGACY_FINANCE` **by default**, so call sites pass nothing and cannot forget. `resolveRelatedTools()` applies the same rule to content cross-links — an ACTIVE page cannot recommend a FinLearn tool even if a content file lists one, while a FinLearn page may still recommend its siblings.

If a status check ever appears inside a component, the rule has leaked and belongs back in `app/lib/tools.js`.

**Future FinLearn migration.** Do not delete these tools, change their routes, or edit their implementations. When they move, the work is: export the finance entries and their `app/<slug>/` directories to the new project, then add redirects. Nothing else in this codebase depends on them — `recharts` and `app/utils/sanitize.js` are used only by that group.

**Ordering.** A single `order` field on each category drives every surface (`CATEGORY_ORDER`). The homepage and nav previously needed separate orderings only because the finance section sat in a different position on each; with finance out of both, one order serves both. Within Documents & PDF the nav still lists tools in a different order from the homepage grid — that is what the per-tool `navOrder` field encodes.

**Deliberately *not* in the registry yet:** per-tool SEO metadata (still `toolMetadata()` in each `layout.js`) and per-tool rich content such as FAQs (still inline JSX). Folding those in is the intended next step, not this one.


### Brand and the legacy finance tools

The public brand is **Tools by Decyfy**. The old TechSolve44 name is gone from every
user-facing surface; the only remaining occurrences are the `techsolve44.com` origin in
`metadataBase`, `toolMeta.js`, `sitemap.js` and `robots.txt`. **Those are deliberate** —
the site is still served from that host, and canonical/sitemap URLs must match the origin
that actually answers. Change them only when DNS moves.

The finance calculators are `LEGACY_FINANCE`. They still build, still work and stay in the
sitemap, but they appear on no public surface: not the homepage, navigation, footer or
related-tool recommendations. The status value is deliberately named without reference to
any future product, because the registry ships to the browser and its string values are
readable in the JS bundle. Do not reintroduce a product name there.

### Tool page content (`app/content/tools/`)

Two registries, deliberately separate:

| | |
|---|---|
| `app/lib/tools.js` | Catalogue facts — name, route, category, status. **Every** tool has an entry. Drives homepage, nav and sitemap. |
| `app/content/tools/` | Page content — explanations, steps, FAQs, workflows. **Optional per tool.** Drives what a visitor reads. |

Adoption is progressive. A tool with no content file renders exactly as before — `getToolContent()` returns `undefined` and `<ToolContent>` returns `null`. There are no empty headings and no errors. Partial content works too: omit a field and only that section disappears.

`app/pdf-merge/` is the reference implementation.

**Adding content for a tool**

1. Create `app/content/tools/<slug>.js` with a default-exported object (copy `pdf-merge.js`).
2. Register it in `app/content/tools/index.js`.
3. In the tool's `page.js`:
   ```js
   import ToolContent from '../components/tool-content/ToolContent';
   import { getToolContent } from '../content/tools';
   const content = getToolContent('<slug>');
   // …then, after the tool interface:
   <ToolContent content={content} />
   ```

**Placement rule.** The heading, the one-line `outcome` and the tool interface stay in `page.js`, above `<ToolContent>`. A visitor must never scroll past an article to reach the tool.

**Schema.** Every field optional except `slug`. Full reference in the header comment of `app/content/tools/index.js`:
`outcome`, `whatItDoes` (paragraph array), `whenToUse`, `workplaceUses`, `howToSteps`, `tips` (all `{title, body}[]`), `faqs` (`{q, a}[]`), `relatedWorkflows`, `relatedTools`.

**Related tools resolve through the registry.** Content files list **slugs only** — `['pdf-split', 'pdf-compress']`. Names, routes, icons and descriptions are looked up via `getToolBySlug()`, so a tool renamed in `app/lib/tools.js` updates every cross-reference. An unknown slug is skipped rather than rendering a dead link.

**Related workflows** are structured content, not an engine:
```js
{ title, description, steps: [
    { slug: 'pdf-organize', note: 'why this step' },   // links via the registry
    { label: 'Review and submit', note: '…' },         // a step that is not a tool
] }
```

**Writing standard.** Content must describe what the tool *actually* does — check the implementation before writing. The Merge PDF claims about bookmarks and form fields were verified against `pdf-lib`'s `copyPages()` output, not assumed. No marketing voice, no padding, and never repeat a point across sections.

**Behavioural constants** that appear in content (limits, caps) should live in a shared module the tool and the content both import — see `app/pdf-merge/limits.js` — so documented limits cannot drift from enforced ones.

### Reusable content components (`app/components/tool-content/`)

- **ToolContent.js** — orchestrator. Renders every section the content object has, in a fixed order, skipping absent ones. One line in a page adds the whole structure.
- **Section.js** — section wrapper (heading + spacing) and `ItemList` for `{title, body}` lists.
- **HowToSteps.js** — numbered steps.
- **FaqList.js** — accordion, reusing the existing `.faq-item` styles.
- **RelatedTools.js** — resolves slugs via the registry.
- **RelatedWorkflows.js** — workflow sequences.

Simple prose and list sections are rendered inside `ToolContent` rather than split into single-purpose components; only sections with genuinely distinct presentation get their own file.

### Shared components (`app/components/`)

- **Header.js** — sticky nav with hover dropdowns (desktop) and accordion (mobile). Nav links come from `getNavigationGroups()` in the registry; there is no local `navGroups` array any more.
- **Footer.js** — four-column footer with hardcoded link lists. Intentionally a curated shortlist, not the full catalogue, so it does *not* read from the registry.
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

**Vercel is the only deployment mechanism.** It builds from GitHub automatically. There is no manual upload step.

### Do not re-enable the Hostinger deployment

The repository previously carried `.github/workflows/deploy.yml`, which built the site and FTP'd `out/` to Hostinger `public_html/` on every push to `main`. **That workflow has been deleted.**

Once Vercel began deploying from the same repository, the workflow meant a single `git push` published the site to two different hosts. Restoring it would resurrect that conflict — during a rebrand it would keep the old brand live on Hostinger while the new one shipped on Vercel. If a deployment pipeline is ever needed again, add it to Vercel, not GitHub Actions.

**Still requires manual verification in GitHub** (not inspectable from the repository): the `FTP_HOST`, `FTP_USERNAME` and `FTP_PASSWORD` repository secrets may still exist, and the Hostinger account may still be serving the old build. Deleting the workflow stops future pushes reaching Hostinger, but does not remove the secrets or take down anything already published there.

### `.htaccess` is inactive on Vercel

`public/.htaccess` is retained but **has no effect**. Vercel does not read Apache configuration. It currently declares:
- a `www.techsolve44.com` → non-www 301 redirect
- one-year `Expires` cache headers for CSS, JS and WOFF2

Neither is in force. Nothing errors — the file is simply ignored, which is exactly why this is easy to miss.

**Any future redirect, rewrite or cache header must be implemented through Vercel** — either a `vercel.json` at the repository root or the project's domain settings in the Vercel dashboard. Note that `output: 'export'` means `redirects()` / `rewrites()` / `headers()` in `next.config.mjs` **cannot** be used; they require a server runtime.

The file is kept for now as a record of the intended behaviour, and because the www→non-www rule will need a Vercel equivalent when the domain is next touched. `npm run build` still copies it into `out/`, which is harmless.

### No `vercel.json`

There is deliberately no `vercel.json`. Vercel auto-detects Next.js and handles `output: 'export'` correctly on its own; pinning `buildCommand` or `outputDirectory` by hand would risk overriding correct behaviour with a worse guess. Add one when there is something real to declare — redirects, headers, or region settings — not before.

### Build ID

The build ID is pinned to `ts44` in `next.config.mjs`, so `_next/static/ts44/` paths are stable. This was originally to keep paths stable across FTP deploys; on Vercel that concern no longer applies, and the override could be renamed or dropped. The **CSS filename hash is not stable** — it changes whenever styles change. Nothing should ever hardcode it.

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

## PDF compression engine — MuPDF removed

`app/lib/pdfCompress.js` used to offer four modes. Two of them (`balanced`, `high`) downsampled every embedded image while keeping text selectable, and a third (`extreme`) flattened pages. All three were implemented with **MuPDF** (WASM), loaded at runtime from `cdn.jsdelivr.net`.

**MuPDF is published under AGPL-3.0-or-later** (verified from the package metadata during the repository audit). Artifex dual-licenses it — AGPL or a paid commercial licence. Rather than carry that obligation into a commercial product, the dependency was removed outright.

**What the tool offers now:**

| Mode | Engine | Text | Notes |
|---|---|---|---|
| Lossless | `pdf-lib` (MIT) | Kept | Structural re-save. Nothing re-encoded. Saving depends entirely on how wastefully the source PDF was written — often small. |
| Strong | `pdfjs-dist` (Apache-2.0) + Canvas + `pdf-lib` | **Lost** | Renders each page to JPEG and rebuilds the document. Large, reliable savings on scanned and image-heavy PDFs. |

**What was lost:** image downsampling *with text preserved*. That genuinely requires a PDF **editing** engine — `pdf-lib` cannot decode image streams across the filters real PDFs use, and `pdf.js` is a renderer, not an editor. There is no way to reinstate that capability with the current dependency set.

**If it is wanted back**, it is a deliberate engine decision, not a package swap. Keep any new engine behind this module's exported surface (`MODES` + `compressPdf`) so `app/pdf-compress/page.js` does not need to change. Do not reintroduce an AGPL engine without a licensing decision first.

**Do not** reintroduce `mupdf` — not as an npm dependency, not as a CDN import, not as a bundled WASM asset.

## Runtime network dependencies

Tool logic runs in the browser, but **six pages fetch from the network at runtime** — worth knowing before claiming the site is fully offline-capable:

| Page | Host | What |
|---|---|---|
| `mf-profit-calculator` | `api.mfapi.in` | Scheme catalogue + NAV history |
| `pdf-compress` | `unpkg.com` | pdf.js worker — **Strong mode only**; Lossless mode is fully offline |
| `pdf-to-word` | `cdnjs.cloudflare.com` | `pdf.js@3.11.174` + worker |
| `pdf-ocr` | `unpkg.com` | pdf.js worker (version from bundled `pdfjs-dist`) |
| `pdf-to-jpg` | `unpkg.com` | pdf.js worker (same) |
| `html-to-pdf` | `cdnjs.cloudflare.com` | `html2pdf@0.10.1` |

The unpkg URLs interpolate `pdfjsLib.version`, so they track whatever `pdfjs-dist` is installed (currently 3.11.174) — bumping that package silently changes the fetched worker URL. All other tools are genuinely local-only.

## Static export and time

Pages are pre-rendered at build time, so **anything derived from the current date must be resolved after mount**, not during render. Calling a `today()` helper inline bakes the build date into the HTML, and React does not patch the attribute on hydration — a `max` on a date input then caps at a date in the past and the browser marks the field invalid. Use `useState('')` + `useEffect`, and treat the empty first-render value as "no constraint yet".

## Web3Forms (contact form + feedback widget)

The access key lives in exactly one place — `app/lib/web3forms.js` — and both `/contact` and `app/components/FeedbackWidget.js` submit through its `submitToWeb3Forms()` helper. Do not inline a second `fetch('https://api.web3forms.com/submit', ...)` anywhere; import the helper.

Two things that matter if you touch this code:

- **A `200` response can still mean failure.** Web3Forms returns HTTP 200 with `{"success": false, "message": "..."}` on a rejected submission (bad key, spam heuristics, etc.). Checking `res.ok` alone is not enough — `submitToWeb3Forms()` throws on `data.success === false` too.
- **Never show a success state without confirming the request actually succeeded.** `/contact` previously called `preventDefault()`, set `sent = true`, and submitted nothing — every visitor who used it for months believed their message was sent when it never left the browser. The key was documented in `PROJECT_INSTRUCTIONS.md` but wired into no code. If you add another form on this site, treat "does the success message require a resolved, checked response" as a hard requirement, not a nice-to-have.

**Verification history**: both the contact form and the feedback widget were confirmed delivering real mail by live tests on 20 Jul 2026 — the first time either was actually verified end-to-end, as opposed to assumed from the docs. Direct requests to `api.web3forms.com` from the Claude Code sandbox get HTTP 403'd by Web3Forms' own bot detection (confirmed IP/fingerprint-based, not a domain check — spoofing `Origin: https://techsolve44.com` made no difference). So automated verification from this environment is not possible; a real submission from a real browser, followed by checking the inbox, is the only way to confirm this integration works.

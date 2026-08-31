# Tools by Decyfy

Free browser-based tools for everyday document and file work — PDF conversion and manipulation, plus image utilities. Everything runs client-side; user files never leave the device.

**Live at https://tools.decyfy.com.** The former `techsolve44.com` domain 308-redirects here.

> **Legacy finance tools.** Ten calculators from the previous product still build and still work at their original routes, but they appear on no public surface. They carry `status: LEGACY_FINANCE` in the registry and are candidates to move to a separate product. Do not promote them or change their routes.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export → out/
npm run lint
```

Tests live in a separate package:

```bash
cd test-harness
npm install && npm run setup      # setup installs the Chromium binary
BASE_URL=http://localhost:3000 npm test
```

> `npm run dev` and `npm run build` share the `.next/` directory. Running a build while the dev server is serving will corrupt it — stop one before starting the other.

## Stack

| | |
|---|---|
| Framework | Next.js 14.2.5, App Router |
| Language | JavaScript (no TypeScript) |
| Styling | Tailwind CSS 3.4 |
| Output | Static export (`output: 'export'`) → `out/` |
| Hosting | **Vercel**, deployed automatically from GitHub |

## Deployment

**Vercel is the only deployment mechanism.** Pushes to `main` deploy automatically.

A GitHub Actions workflow that FTP-deployed to Hostinger has been removed — with Vercel building from the same repository it caused every push to publish to two hosts. **Do not re-add it.** Full context in `CLAUDE.md`.

`public/.htaccess` is retained but **has no effect on Vercel**. Any redirect or cache header must go through `vercel.json` or the Vercel dashboard.

## The tool catalogue

`app/lib/tools.js` is the **single source of truth**. One entry there feeds the homepage grid, the header navigation and the sitemap.

Adding a tool: add a registry entry, then create `app/<slug>/page.js` and `app/<slug>/layout.js`. Nothing else needs a manual list update.

### Tool page content

Rich page content (explanations, how-to steps, FAQs, workflows) lives separately in `app/content/tools/<slug>.js` and is **optional**. A tool without a content file renders exactly as before — the architecture supports progressive migration, one tool at a time.

`app/pdf-merge/` is the reference implementation. Related tools and workflow steps reference registry slugs only, so names and URLs are never duplicated. See `CLAUDE.md` for the schema and how to add content to another tool.

### Product taxonomy

Five categories, defined in `CATEGORY_META` in the registry:

| Category | ACTIVE tools |
|---|---|
| Documents & PDF | 12 |
| File & Image | 3 |
| Data & Text | 0 |
| Business & Work | 0 |
| Generators | 0 |

The last three exist so the taxonomy is ready for new tools. Empty categories are never rendered. **Never add a registry entry for a tool that does not exist** — no placeholders, no "coming soon" cards, no sitemap entries for unbuilt tools.

Tools are filed by **the artefact the user starts with**: a PDF or document goes to Documents & PDF, an image goes to File & Image.

Each tool carries a `status`:

- **`ACTIVE`** — the 15 document and image tools that form the public catalogue.
- **`LEGACY_FINANCE`** — the 10 finance calculators. Still functional, still routed, still in the sitemap and still linked from the footer, but **excluded from the homepage catalogue, the navigation and related-tool recommendations**. Earmarked to move to a separate FinLearn product.

The rule is enforced centrally: the registry selectors exclude `LEGACY_FINANCE` by default, so no component filters by status.

## Tools

**Documents & PDF** — PDF to Word · PDF to JPG · Merge · Split · Organize Pages · Compress · Word to PDF · Watermark · Add Page Numbers · HTML to PDF · OCR · Remove Password

**Images & Scanning** — Image to PDF · Image Resizer · Scan to PDF

**Financial calculators** *(FinLearn migration candidates)* — EMI · SIP · Lumpsum · PPF · Income Tax · Graham Number · FIRE · Sharpe Ratio · Stock Profit · MF Profit

## Privacy

No tool uploads user files to a server. Six pages do fetch an engine or dataset from a CDN at runtime (pdf.js workers, Tesseract language data, MFAPI scheme data) — the files themselves are still processed locally. `CLAUDE.md` lists exactly which pages and why.

## Contributing notes

Two constraints worth knowing before making changes:

- **Never add `export const metadata` to a tool `page.js`** — they are all `'use client'`, and it is a build error. Metadata belongs in the sibling `layout.js`, via `toolMetadata()`.
- **Do not reintroduce MuPDF.** It was removed from PDF compression because it is AGPL-3.0-or-later. See `CLAUDE.md` for what replaced it and what capability was lost.

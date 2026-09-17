# Decisions

A running record of the decisions behind Tools by Decyfy (formerly TechSolve44):
what was decided, why, and what it cost. It covers the project from the first
commit onwards and is meant to be appended to, not rewritten.

**How to use this file**

- Add a new entry at the end of the log for any decision that changes what the
  product is, how it is built, what it depends on, or what it promises users.
- Never delete an entry. If a decision is reversed, add a new one and mark the
  old one *Superseded by D-xx*.
- Dates are commit dates. Where a decision was made across several sessions and
  committed together, the commit date is used and the entry says so.
- Keep entries factual. If something was not verified, say so.

---

## Index

| ID | Date | Decision | Status |
|---|---|---|---|
| D-01 | 2026-04-30 | Browser-only processing, static site | Active |
| D-02 | 2026-07-20 | Forms must prove delivery before showing success | Active |
| D-03 | 2026-08-27 | Vercel is the only deployment path; Hostinger FTP removed | Active |
| D-04 | 2026-08-27 | Remove MuPDF (AGPL); no AGPL engine without a licensing decision | Active |
| D-05 | 2026-08-27 | PDF to Word rebuilt; render with print intent | Active |
| D-06 | 2026-08-27 | Central tool registry as single source of truth | Active |
| D-07 | 2026-08-27 | Optional per-tool rich content, separate from the registry | Active |
| D-08 | 2026-08-28 | Five-category product taxonomy | Active |
| D-09 | 2026-08-28 | **Finance calculators hidden from discovery, not deleted** | Active |
| D-10 | 2026-08-31 | Rebrand to Tools by Decyfy on tools.decyfy.com | Active |
| D-11 | 2026-08-31 | New Open Graph image under a new filename | Active |
| D-12 | 2026-08-31 | Delete `public/.htaccess` | Active |
| D-13 | 2026-08-31 | Pure logic modules, proved by unit tests | Active |
| D-14 | 2026-08-31 | Expand to 36 tools in four phases on a pre-production branch | Complete |
| D-15 | 2026-09-01 | Generator PDFs print "Rs." rather than embedding a font | Active |
| D-16 | 2026-09-01 | HEIC: native decode first, LGPL `heic-to` as fallback | Active — not yet verified on a real iPhone photo |
| D-17 | 2026-09-01 | Redact PDF rasterises only the pages it redacts | Active |
| D-18 | 2026-09-01 | Sign PDF is a visible signature, not a certified one | Active |
| D-19 | 2026-09-01 | PDF to Excel: shared table detector and a small XLSX writer | Active |
| D-20 | 2026-09-01 | A tool is complete only when its downloaded output is inspected | Active |
| D-21 | 2026-09-17 | Google Analytics replaced with `G-258PZM6WZJ` | Active |
| D-22 | 2026-09-17 | Expansion merged to production | Complete |
| D-23 | 2026-09-17 | Test fixtures committed to the repository | Active |

---

## Log

### D-01 — Browser-only processing, static site

**Date:** 2026-04-30 (founding decision) · **Commit:** `a8eb293`

**Decision.** Every tool runs entirely in the user's browser. The site is a
Next.js static export with no server runtime and no API routes.

**Why.** Users' documents never leave their device, which is the product's core
privacy promise. There is also no server cost and nothing server-side to secure.

**Consequences.**
- Every page is a client component; metadata lives in each tool's `layout.js`.
- A few pages still fetch *engines or data* at runtime — pdf.js workers,
  Tesseract language data, the mutual-fund API. The user's files are never
  uploaded. CLAUDE.md lists exactly which pages do this.
- Anything dated must be resolved after mount, not at build time, or the build
  date is baked into the HTML.

---

### D-02 — Forms must prove delivery before showing success

**Date:** 2026-07-20 · **Commits:** `75824f8`, `4d2614e`

**Context.** The contact form called `preventDefault()`, showed "sent", and
submitted nothing. For months every visitor believed their message had arrived.

**Decision.** Both the contact form and the feedback widget submit through one
Web3Forms helper, and a success state requires a resolved, checked response.
Web3Forms returns HTTP 200 with `success: false` on rejection, so checking the
status code alone is not enough.

**Consequences.** Both integrations were verified by real submissions arriving
in the inbox on 20 July 2026. They cannot be verified automatically from the
development sandbox, which Web3Forms blocks.

---

### D-03 — Vercel is the only deployment path

**Date:** 2026-08-27 · **Commit:** `c4471cc`

**Context.** A GitHub Actions workflow FTP'd every push to Hostinger. Once Vercel
also deployed from the same repository, one push published to two hosts — and
during a rebrand it would have kept the old brand live on one of them.

**Decision.** Delete the Hostinger workflow. Vercel builds from GitHub and is the
only deployment mechanism. Pushing `main` deploys production; other branches get
Preview deployments.

**Consequences.**
- Redirects, rewrites and headers must be configured in Vercel. `output: 'export'`
  means `next.config.mjs` cannot declare them.
- **Open:** the FTP secrets may still exist in GitHub, and Hostinger may still be
  serving an old build. Deleting the workflow did not remove either.

---

### D-04 — Remove MuPDF; no AGPL engine without a licensing decision

**Date:** 2026-08-27 · **Commit:** `c4471cc`

**Context.** MuPDF powered three of the four PDF compression modes. It is licensed
AGPL-3.0-or-later (or a paid commercial licence).

**Decision.** Remove it entirely rather than carry AGPL obligations into a
commercial, ad-supported product. Rebuild compression on `pdf-lib` (MIT) and
`pdfjs-dist` (Apache-2.0), both already dependencies.

**Consequences.**
- Compress PDF now has two honest modes: **Lossless** (structural re-save, text
  kept) and **Strong** (pages rendered to images, text lost).
- **Capability lost:** image downsampling *with text preserved*. That genuinely
  needs a PDF editing engine; there is no way to reproduce it with the current
  dependencies.
- Rule going forward: no AGPL dependency — npm, CDN or bundled WASM — without an
  explicit licensing decision recorded here first.

---

### D-05 — PDF to Word rebuilt; render with print intent

**Date:** 2026-08-27 (several sessions, committed together) · **Commit:** `c4471cc`

**Context.** A user converted a government report and got tables shredded into
one word per cell; the tab also froze in Edge. Opening the output in Pages and
Google Docs revealed two further faults that Word had been hiding.

**Decision and fixes.**
- Gap-based cell tokenising with block-level column clustering, so ordinary
  paragraphs no longer become fake tables. The thresholds were calibrated against
  real report PDFs and are load-bearing.
- Write real column widths. Word auto-fits over missing widths; Pages and Google
  Docs obey them literally and rendered columns 1.8 mm wide.
- Give every image a unique id (required upgrading `docx` 8 → 9). Duplicate ids
  made Google Docs reject the whole file.
- Add an Exact Layout mode: each page as a full-page image, pixel-identical but
  not editable.
- Render with `intent: 'print'` in PDF to Word, PDF to JPG and OCR. Display intent
  is suspended by browsers in background tabs, so switching tabs mid-conversion
  hung forever.

**Consequences.** Verification had to include opening output in more than one
application — checking the XML alone missed the column-width bug.

---

### D-06 — Central tool registry

**Date:** 2026-08-27 · **Commit:** `c4471cc`

**Decision.** `app/lib/tools.js` is the single source of truth for the catalogue.
The homepage, navigation, sitemap and (from D-10) the footer all derive from it,
replacing four hand-maintained lists. `public/sitemap.xml` was replaced by
`app/sitemap.js`, verified to produce identical output at the time.

**Consequences.** Adding a tool means one registry entry. Discovery rules live in
the registry's selectors and nowhere else — if a component ever filters by status,
the rule has leaked.

---

### D-07 — Optional per-tool rich content

**Date:** 2026-08-27 · **Commit:** `c4471cc`

**Decision.** Explanations, steps, tips and FAQs live in `app/content/tools/`,
separate from the catalogue registry, and are optional per tool. Related tools
reference registry slugs only, so a rename updates every cross-link.

**Standard.** Content must describe what the tool actually does, checked against
the implementation. Merge PDF's claims about bookmarks and form fields were
verified against real `pdf-lib` output, not assumed.

**Later addition (D-17 to D-19).** A `limitations` field, rendered directly under
"What this tool does" and before anything promotional, for tools whose trade-offs
a user must not miss.

---

### D-08 — Five-category product taxonomy

**Date:** 2026-08-28 · **Commit:** `e5d4ce2`

**Decision.** Five public categories: Documents & PDF, File & Image, Data & Text,
Business & Work, Generators. Tools are filed by **the artefact the user starts
with**, not the one they end with — so PDF to JPG is under Documents and Image to
PDF under File & Image.

**Consequences.** Empty categories are dropped by the selectors and never render.
No placeholder or "coming soon" tools were created: the live catalogue only
contains tools that work.

---

### D-09 — Finance calculators hidden from discovery, not deleted

**Dates:** hidden 2026-08-28 (`e5d4ce2`); footer links removed and status renamed
2026-08-31 (`7181a78`). This entry expands and corrects the original note of
2026-09-01, which said the calculators were "removed" — they were not.

**Context.** Tools by Decyfy is positioned as a workplace and office productivity
product. Ten personal-finance and investment calculators — built when the site
was TechSolve44 — no longer fit that positioning, and the homepage copy was still
advertising them.

**Decision.** Keep all ten working, but take them off every public discovery
surface. Nothing was deleted, moved or redirected.

**The ten calculators (status `LEGACY_FINANCE`):**

| Calculator | Route |
|---|---|
| EMI Calculator | `/emi-calculator` |
| SIP Calculator | `/sip-calculator` |
| Lumpsum Calculator | `/lumpsum-calculator` |
| PPF Calculator | `/ppf-calculator` |
| Income Tax Calculator | `/income-tax-calculator` |
| Graham Number Calculator | `/graham-number-calculator` |
| FIRE Calculator | `/fire-calculator` |
| Sharpe Ratio Calculator | `/sharpe-ratio-calculator` |
| Stock Profit Calculator | `/stock-profit-calculator` |
| MF Profit Calculator | `/mf-profit-calculator` |

**How it was done, step by step.**

1. **Label** (2026-08-27, `c4471cc`). The registry gained a `status` field and the
   calculators were marked for possible migration. Nothing was hidden yet.
2. **Hide** (2026-08-28, `e5d4ce2`). `getHomepageSections()`,
   `getNavigationGroups()` and `getToolsByCategory()` began excluding them **by
   default**, so no call site has to remember the rule. `resolveRelatedTools()`
   applies the same rule to content cross-links: a public tool page can never
   recommend a finance calculator, while a finance page may still link to its
   siblings. The footer was deliberately left linking all ten at this point so the
   pages would not become orphaned.
3. **Rebrand** (2026-08-31, `7181a78`). The footer switched to reading from the
   registry, which removed the finance links from it. The homepage copy that
   advertised financial calculators was rewritten.
4. **Rename the status** (same commit). The original status value named a planned
   future product. Because the registry ships to the browser, that name was
   readable in the public JavaScript bundle. It was renamed to the neutral
   `LEGACY_FINANCE`. Behaviour did not change.

**Where they appear now (verified live 2026-09-17).**

| Surface | Finance calculators |
|---|---|
| Homepage | Not shown |
| Navigation | Not shown |
| Footer | Not shown |
| Related-tool recommendations on public pages | Not shown |
| Direct URL | **Works** (HTTP 200) |
| `sitemap.xml` | **Still listed** (all 10) |

**Why keep them at all.**
- They still work and still receive search traffic; deleting them would throw
  away rankings and break anyone's bookmark.
- Keeping them in the sitemap preserves that search presence while the product
  moves on.
- Moving them to a separate product later is a clean operation: export the ten
  registry entries and their `app/<slug>/` folders, then add redirects. Nothing
  else in the codebase depends on them.

**Guardrails that still apply.**
- Do not delete these tools, change their routes, or edit their implementations
  without a new decision here.
- The Financial Calculator disclaimer stays in the Terms of Service. The pages are
  still reachable, so removing it would drop legal cover for a service that still
  works.
- Do not reintroduce a future product name anywhere that ships to the browser.
- The MF Profit Calculator depends on the third-party `api.mfapi.in`. Its test
  failures during September 2026 were that API returning HTTP 502, confirmed when
  it recovered and the tests passed with no code change.

**Still open.** Whether the calculators eventually move to a separate product,
are redirected, or are retired. If that happens, record it as a new decision that
supersedes this one.

---

### D-10 — Rebrand to Tools by Decyfy

**Date:** 2026-08-31 · **Commits:** `7181a78`, `be42994`, `d7a101b`

**Decision.** TechSolve44 becomes Tools by Decyfy, live at `tools.decyfy.com`.
`techsolve44.com` 308-redirects to it, per path.

**Consequences.**
- Every canonical, `og:url`, sitemap entry, JSON-LD URL and robots.txt sitemap
  line was pointed at the live host — 31 references. Pointing them at the old host
  would have declared each page canonical to a URL that redirects away.
- New SVG logo and favicon, palette taken from the logo; Plus Jakarta Sans for
  headings, Inter kept for body so existing tool layouts keep their metrics.
- `GDB Advisories LLP` is retained where the operating entity is legally required.
- Two internal identifiers keep the old `ts44` prefix on purpose because changing
  them changes behaviour: the build ID (part of every static asset URL) and one
  element id on the EMI calculator. Comments noting that the old domain redirects
  also remain, because that is still true.
- **Open:** Google Search Console change-of-address and AdSense re-verification
  for the new domain.

---

### D-11 — New Open Graph image under a new filename

**Date:** 2026-08-31 · **Commit:** `be42994`

**Decision.** Replace the social card with Tools by Decyfy artwork, cropped to
1200×630, and rename `og-image.jpg` → `og-image.png`.

**Why the rename.** Facebook, LinkedIn and X cache preview images by URL. Reusing
the old filename risked them serving the TechSolve44 card for weeks.

---

### D-12 — Delete `public/.htaccess`

**Date:** 2026-08-31 · **Commit:** `8c0f394`

**Decision.** Delete it. It was Apache configuration that Vercel never reads, and
after the domain move it also pointed at a retired host.

**Consequences.** Its www → non-www redirect and one-year cache headers were never
in force on Vercel. If either is wanted, it must be configured in Vercel.

---

### D-13 — Pure logic modules, proved by unit tests

**Date:** 2026-08-31 onwards · **Commit:** `8c0f394` and each phase

**Decision.** Anything that can be pure *is* pure — no React, DOM or canvas — so
it can be proved in Node with expected values worked out by hand: `calc.js`,
`textTools.js`, `generators.js`, `image.js`, `pdfTables.js`, `xlsx.js`.

**Consequences.** 180 unit tests run in under two seconds. The table detector
behind PDF to Word had no tests while it lived inside a page component; extracting
it (D-19) is what made it testable.

---

### D-14 — Expand to 36 tools in four phases, on a pre-production branch

**Dates:** 2026-08-31 to 2026-09-01 · **Branch:** `tool-expansion-v1`

**Decision.** Build 21 new tools in four phases on a separate branch, never on
`main`, with Vercel Preview deployments for internal review before any merge.

| Phase | Commit | Tools |
|---|---|---|
| 1 | `b20483b` | JSON Formatter, Base64, URL Encode · Percentage, Percentage Increase, GST, Profit Margin, Break-even, ROI, Salary Hike, Working Days |
| 2 | `daeb897` | Invoice, Payslip and Rent Receipt generators |
| 3 | `70fcc75` | Compress Image, Crop Image, HEIC to JPG |
| 4 | `737d020` | Rotate PDF, Sign PDF, Redact PDF, PDF to Excel |

**Result.** 36 public tools: Documents & PDF 16, File & Image 6, Data & Text 3,
Business & Work 8, Generators 3 — plus the 10 hidden finance calculators (D-09).
Merged in D-22.

---

### D-15 — Generator PDFs print "Rs." rather than embedding a font

**Date:** 2026-09-01 · **Commit:** `daeb897`

**Context.** `pdf-lib`'s standard fonts cannot encode the ₹ sign or Devanagari.

**Decision.** Print amounts as "Rs." and warn the user when a field contains
characters the PDF cannot draw, rather than silently dropping them. Embedding a
Unicode font would add roughly 1.1 MB and still not cover Indic scripts.

---

### D-16 — HEIC: native decode first, `heic-to` as fallback

**Date:** 2026-09-01 · **Commit:** `70fcc75`

**Context.** Only Safari decodes HEIC natively. Every JavaScript decoder is libheif
compiled for the browser, which is LGPL-3.0; there is no MIT alternative.

**Decision.**
- Try the browser's own decoder first; on Safari and iOS that costs nothing.
- Fall back to **`heic-to` (LGPL-3.0)**, kept as an unmodified npm module and
  loaded as its own lazy chunk (~3 MB) so no other page pays for it. LGPL permits
  use in a proprietary product provided the library stays replaceable, which this
  arrangement preserves.
- Reject **`heic2any`**: it advertises MIT but bundles libheif, so its stated
  licence does not cover the code it ships.
- Identify HEIC by file contents, not extension.

**Status.** Implemented and tested with *converted* HEIC files only. **Not verified
against a camera-original iPhone photo.** That test is required before HEIC to JPG
can be called verified. Files sent by email or WhatsApp are usually converted to
JPEG in transit, so the test file should come by AirDrop or USB.

---

### D-17 — Redact PDF rasterises only the pages it redacts

**Date:** 2026-09-01 · **Commit:** `737d020`

**Context.** A black rectangle drawn over text in most PDF editors leaves the text
in the file, selectable and extractable.

**Decision.** Pages carrying a redaction are rendered to an image, the boxes are
painted in **before** encoding, and the page is rebuilt from that image; the
original page object is never copied into the output. Pages without redactions are
copied across unchanged and keep their text. An opaque vector rectangle is also
drawn over each region so it is exactly black.

**Trade-off, stated in the UI and content.** Redacted pages lose selectable and
searchable text, and files get larger. Metadata and attachments are not removed.

**Verified.** Known secret strings were absent from text extraction and from a raw
byte scan of the output; box interiors were pure black across 128,452 sampled
pixels; the untouched page kept its text. A redaction at the very bottom edge was
initially missed by the test itself — caught only by rendering the output to an
image — and fixed.

---

### D-18 — Sign PDF is a visible signature, not a certified one

**Date:** 2026-09-01 · **Commit:** `737d020`

**Decision.** Sign PDF draws a typed or hand-drawn signature image onto chosen
pages without flattening the document. It is described everywhere as a visible
signature mark.

**Guardrail.** Never describe it as a digital, certified, cryptographic or legally
binding signature. There is no certificate, identity check or tamper detection.

---

### D-19 — PDF to Excel: shared table detector, small XLSX writer

**Date:** 2026-09-01 · **Commit:** `737d020`

**Decisions.**
- **Reuse, don't fork.** The table detector was lifted verbatim out of PDF to Word
  into `app/lib/pdfTables.js`, and PDF to Word now imports it. Its own tests still
  pass unchanged.
- **Write XLSX with `jszip` (MIT OR GPL-3.0-or-later; MIT terms apply).** Already
  in the dependency tree via `docx`, now declared directly. A ~170-line writer was
  chosen over `exceljs` (~22 MB installed), `write-excel-file` (~2.7 MB) and the
  npm `xlsx` package, which is stuck at 0.18.5 with a known prototype-pollution
  advisory while fixed versions are published only to the vendor's CDN.
- **Fail honestly.** A PDF with no text layer is told it is a scan and pointed to
  OCR; a PDF with text but no grid is told so. Nothing is invented.
- Identifiers such as `007` or `SKU-1001` stay text; only unambiguous numbers
  become numbers.

---

### D-20 — Output is inspected, not assumed

**Date:** 2026-09-01, applied across Phases 2–4

**Decision.** A tool is not complete because its page renders, the build passes or
a download starts. The downloaded file is inspected independently — PDFs with
pdf.js and pdf-lib, workbooks with a spreadsheet library, images by decoding them
and rendering to pixels.

**Why.** This standard caught real bugs that passing tests did not: a blank second
page on every generated document, a revenue-stamp option that did nothing, a
payslip silently dropping three fields, a redaction that was never applied, and a
content section that was written but never rendered.

---

### D-21 — Google Analytics replaced with `G-258PZM6WZJ`

**Date:** 2026-09-17 · **Commits:** `d7a101b`, `b085974`

**Decision.** Replace the previous property `G-FFVH7DK4LD` with `G-258PZM6WZJ`,
using Google's standard `gtag.js` snippet (async loader, one config call).

**Verified live.** Every page in the sitemap carries the tag, the old ID appears
nowhere, and a real browser session sent a collection request tagged
`G-258PZM6WZJ`.

**Note.** Historical data remains in the old property; it does not carry over.

---

### D-22 — Expansion merged to production

**Date:** 2026-09-17 · **Merge commit:** `14508d9`

**Decision.** After review on the Vercel Preview, merge `tool-expansion-v1` into
`main` and deploy.

**Details.** `main` had nine documentation-only commits the branch lacked, so this
was a true merge; there were no conflicts. The merged code was confirmed identical
to the reviewed branch apart from those documents.

**Verified live.** All 52 sitemap URLs return 200, `ads.txt` and `robots.txt` are
served, `techsolve44.com` still redirects, and unknown URLs reach the 404 page.

---

### D-23 — Test fixtures committed to the repository

**Date:** 2026-09-17 · **Commit:** `7a78e54`

**Context.** The image and Phase 4 fixtures had been generated into a temporary
folder. When it was cleared, 40 tests failed on missing files.

**Decision.** Commit the fixtures to `test-harness/fixtures/` (4.8 MB) along with
the script that regenerates them, using only the harness's Chromium and the site's
`pdf-lib`. Test downloads go to the git-ignored `test-harness/test-output/`.

**Note.** The HEIC fixtures are converted files and are not evidence for D-16.

---

## Open items

Carried forward from the decisions above. Move an item into a new decision entry
when it is resolved.

| Item | From | Notes |
|---|---|---|
| Verify HEIC to JPG with a camera-original iPhone photo | D-16 | Transfer by AirDrop or USB |
| Remove Hostinger FTP secrets from GitHub; confirm Hostinger is no longer serving an old build | D-03 | Not visible from the repository |
| Google Search Console change-of-address to `tools.decyfy.com` | D-10 | |
| AdSense re-verification for the new domain | D-10 | |
| Long-term future of the ten finance calculators | D-09 | Keep, move to a separate product, or retire |
| `npm audit` reports 14 vulnerabilities (12 high, 2 critical) | D-19 | All in pre-existing packages (`next`, `pdfjs-dist`, lint tooling, `tar`); fixes need major upgrades |
| Image downsampling with text preserved in Compress PDF | D-04 | Needs a non-AGPL PDF editing engine, or a licensing decision |

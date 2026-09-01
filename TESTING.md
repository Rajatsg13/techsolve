# Testing and beta checklist

This branch (`tool-expansion-v1`) is pre-production. Nothing here has been
merged to `main` or deployed.

## Running the tests

```bash
npm run build && npx serve out -l 4599
cd test-harness
npx playwright test --grep @unit                              # pure logic, no server needed
BASE_URL=http://localhost:4599 npx playwright test            # everything else
```

Always test against a local build, never the default `BASE_URL`, which points
at production.

| Suite | Tag | Count | Needs a server |
|---|---|---|---|
| Pure logic — calculations, text, generators, image geometry, table detection, XLSX | `@unit` | 180 | no |
| Page loads and console cleanliness | `@pages` | 44 | yes |
| Generator PDFs end to end | `@generators` | 7 | yes |
| Image tools end to end | `@images` | 22 | yes |
| Existing PDF tools (regression) | `@pdf` | 10 | yes |
| Rotate / Sign / Redact / PDF to Excel | `@pdf4` | 22 | yes |

285 tests in total.

## Known environmental failures

`calculators.spec.js` fails in the MF Profit Calculator whenever `api.mfapi.in`
is unreachable — it returned HTTP 502 throughout Phases 2 and 3, giving 3
failures. **This has since been confirmed environmental**: during Phase 4 the
API returned 200 again and the same suite passed 37/38 with one flaky
network-timing test, with no code change in between. No MF file has been
modified on this branch. Check the API responds before treating any failure
there as a regression.

## Verification standard

A tool is only "verified" when its **downloaded output file** has been opened
and checked — dimensions, format and decodability — not when the browser
preview looked right. The generator PDFs are parsed back with pdf.js; the image
outputs are written to disk and re-opened with Pillow.

---

## HEIC to JPG — NOT YET VERIFIED

**Do not ship this tool until the check below has been done.**

Everything about it is implemented and passes automated tests, but every HEIC
file used so far was produced by macOS `sips` from a JPEG. A converted file is
not proof: a real iPhone camera HEIC differs in ways that matter —

- 10-bit HEVC rather than 8-bit
- an EXIF orientation flag that must be honoured or the photo comes out rotated
- Live Photo files carrying an embedded video track
- HDR gain maps and auxiliary images
- much larger dimensions and file sizes

### Required before release

1. Take a photo on an iPhone with **Settings › Camera › Formats › High
   Efficiency** (the default).
2. Transfer it **without** letting anything convert it — AirDrop to a Mac, or a
   USB copy. Do **not** email it or send it through WhatsApp; both silently
   convert to JPEG.
3. Confirm it is genuinely HEIC: `file photo.HEIC` should report HEIF, and the
   bytes at offset 4–12 should read `ftyp` followed by a HEIC brand.
4. Convert it with the tool and check the downloaded JPG:
   - [ ] opens without error
   - [ ] **orientation is correct** — a portrait photo is not sideways
   - [ ] colours look right, with no green or magenta cast (a 10-bit decode bug)
   - [ ] dimensions match the original
   - [ ] the whole frame is present, not a crop
5. Repeat with: a portrait photo, a Live Photo, an HDR photo, and a burst frame.
6. Repeat in Chrome **and** Safari — they take different code paths (Safari
   decodes natively, Chrome downloads the libheif decoder).

Until every box is ticked, treat HEIC to JPG as implemented but unverified.

---

## Dependency added in Phase 4

`jszip` **3.10.1 — MIT OR GPL-3.0-or-later** (the MIT terms apply).

It was already in the tree as a transitive dependency of `docx`; Phase 4
promotes it to a direct dependency rather than relying on that continuing to be
true. It backs `app/lib/xlsx.js`, a small hand-rolled XLSX writer.

Why not a spreadsheet library: what the site needs to write is plain values in
plain grids. `exceljs` (MIT) is ~22 MB installed with a large browser bundle,
`write-excel-file` (MIT) ~2.7 MB, and the npm-published `xlsx` (SheetJS,
Apache-2.0) is stuck at 0.18.5 with a known prototype-pollution advisory —
fixed releases are published only to the vendor's own CDN. An .xlsx file is a
zip of a few XML parts, so the writer is ~170 lines and its output is verified
by opening real workbooks.

Note: `npm audit` reports 14 vulnerabilities in the tree (12 high, 2 critical).
All are in packages that predate this branch — `next`, `pdfjs-dist`, the eslint
tooling, `tar` — and none come from `heic-to` or `jszip`. Worth addressing, but
separately, since the fixes involve major version bumps.

## Dependency added in Phase 3

`heic-to` **1.5.2 — LGPL-3.0**, wrapping libheif (also LGPL-3.0).

Why a dependency at all: HEIC is HEVC in an ISOBMFF container. Safari decodes it
natively; Chrome, Edge and Firefox do not, and no browser API exists. Every
JavaScript decoder is libheif compiled to asm.js or wasm — there is no
MIT-licensed alternative.

Why this one:

- `heic2any` advertises MIT but **bundles libheif into its dist**, so its stated
  licence does not cover the code it ships. Rejected.
- `heic-to` declares LGPL-3.0 honestly and keeps libheif as a separate module.

LGPL-3.0 is not the AGPL problem that got MuPDF removed. LGPL permits use in a
proprietary application provided the library stays replaceable, so it is kept as
an unmodified npm package loaded as its own dynamic chunk rather than inlined
into application code.

Cost: ~2.9 MB, dynamically imported only when a file actually needs decoding.
It is **not** in any page's initial bundle — `/heic-to-jpg` first-load JS is
136 kB — and Safari users usually never download it, because the native path
succeeds first.

## Phase 4 verification performed

Outputs were written to disk and inspected independently — pdf.js and pdf-lib
for PDFs, a spreadsheet library for XLSX, and rendered PNGs for anything
visual.

**Rotate PDF** — `/Rotate` values came back exactly `[90, 270, 180, 0]` as set
per page; page count and MediaBox unchanged; every page still carried text, and
all four page markers extracted, confirming nothing was rasterised.

**Sign PDF** — page counts preserved and text preserved on every page. Image
XObjects landed on exactly the intended pages: `[1,0,0,0]` for one page,
`[1,1,1,1]` for all, and `[0,1,0,1]` for the range `2,4`. Rendered pages show
the signature placed correctly, transparent, unclipped, on both portrait and
landscape.

**Redact PDF** — the security check, run against a fixture with known strings:

- all four secrets absent from text extraction
- all four secrets absent from a **raw byte scan** of the file, which is what
  would catch a duplicated page or a hidden layer
- redacted pages report 0 text characters; the untouched page still reports 63,
  so only what was redacted was rasterised
- box interiors sampled across 128,452 pixels are **pure black (0,0,0)**
- page count and dimensions preserved, portrait and landscape
- redaction hard against the bottom page edge verified

**PDF to Excel** — workbooks opened and every cell compared with the source
fixture. Numbers arrive as numbers and `SKU-1001` correctly stays text. The
two-page table merged to 25 rows (1 header + 24 items), with the repeated header
on page 2 dropped; with merging off it split into two 13-row sheets. A PDF with
no text layer produces an explicit "no text layer" message and no download.

**Mobile** — all four routes measured at 375 px with zero overflowing elements
and no console errors; rotate buttons meet a 28 px touch target; redaction
drags work at phone width.

## Bugs found by verification, not by tests passing

- The near-edge redaction appeared to work but the box was never registered —
  Playwright cannot move the mouse outside the viewport, so a drag aimed at the
  bottom of a tall page silently landed higher. Only rendering the output to an
  image revealed the secret still visible. The test now uses a tall viewport and
  asserts the third box exists.
- Drawn signatures were embedded as the whole drawing pad, so a signature drawn
  in one corner arrived tiny. Now trimmed to its ink bounds.
- The `limitations` content field was written for three tools but `ToolContent`
  did not render it — the content would have been silently dropped. The section
  now renders directly under "What this tool does".

## Other beta checks

- [ ] Generators: confirm a real invoice, payslip and rent receipt read correctly
      to someone who issues them for a living
- [ ] Compress Image: check output against a real upload form with a hard limit
- [ ] Crop Image: try the drag handles on an actual phone, not just an emulated
      viewport
- [ ] Confirm the legacy finance tools remain reachable by direct URL and stay
      absent from nav, homepage and search
- [ ] Redact PDF: run a real document with genuinely sensitive content through
      it, then open the result and try to select the redacted area
- [ ] Sign PDF: confirm with whoever is receiving the document that a visible
      signature is acceptable, rather than a certified one
- [ ] PDF to Excel: try a real bank statement and a real supplier invoice, and
      check the numbers against the source rather than trusting the preview
- [ ] Rotate PDF: confirm the rotation survives being opened in Acrobat, Preview
      and a browser viewer

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
| Calculations, text, generators, image geometry | `@unit` | 150 | no |
| Page loads and console cleanliness | `@pages` | 40 | yes |
| Generator PDFs end to end | `@generators` | 7 | yes |
| Image tools end to end | `@images` | 21 | yes |

## Known environmental failures

`calculators.spec.js` has 3 failures in the MF Profit Calculator whenever
`api.mfapi.in` is unreachable — it returned HTTP 502 during Phase 2 and Phase 3.
These are unrelated to this branch: no MF file has been modified, and the tool
depends on a live third-party API. Do not treat them as regressions without
first checking that the API responds.

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

## Other beta checks

- [ ] Generators: confirm a real invoice, payslip and rent receipt read correctly
      to someone who issues them for a living
- [ ] Compress Image: check output against a real upload form with a hard limit
- [ ] Crop Image: try the drag handles on an actual phone, not just an emulated
      viewport
- [ ] Confirm the legacy finance tools remain reachable by direct URL and stay
      absent from nav, homepage and search

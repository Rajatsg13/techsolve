# TechSolve44 Test Harness

Playwright functional tests for [techsolve44.com](https://techsolve44.com).

## Setup

```bash
npm install
npm run setup   # installs Chromium browser
```

## Run Tests

```bash
npm test                    # all tests, headless
npm run test:headed         # all tests, visible browser
npm run test:pdf            # PDF tools only
npm run test:calc           # calculators only
npm run test:ui             # interactive Playwright UI
```

## Test Files

| File | Tag | What it covers |
|------|-----|----------------|
| `tests/pages.spec.js` | `@pages` | All 27+ pages load with HTTP 200, no JS errors |
| `tests/pdf-tools.spec.js` | `@pdf` | Upload PDF → click action → verify download |
| `tests/calculators.spec.js` | `@calc` | Calculator pages show numeric results |

## Test PDF

`test-sample.pdf` — 2-page PDF with text and table-like content, used by PDF tool tests.

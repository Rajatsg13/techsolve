// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * End-to-end tests for the Phase 4 PDF tools.
 * Tag: @pdf4
 *
 * Every test saves the real downloaded bytes into OUT_DIR. The files are then
 * inspected independently (pdf.js for PDFs, a spreadsheet library for XLSX) —
 * a download starting is not evidence that the output is correct.
 */

const FIX = process.env.PDF4_FIXTURES
  || '/private/tmp/claude-501/-Users-rajat-Desktop-Dhyai-test/36af64ad-458a-449b-acc0-d4f9191ff638/scratchpad/pdffix';
const OUT = process.env.PDF4_OUT
  || '/private/tmp/claude-501/-Users-rajat-Desktop-Dhyai-test/36af64ad-458a-449b-acc0-d4f9191ff638/scratchpad/out4';

const fx = (n) => path.join(FIX, n);
test.beforeAll(() => fs.mkdirSync(OUT, { recursive: true }));

async function upload(page, file) {
  await page.locator('input[type="file"]').setInputFiles(fx(file));
}
/**
 * Record every blob the page hands to the browser.
 *
 * Capturing only "the next blob" is not good enough here: pdf.js registers its
 * worker through a blob URL when it initialises, so the first blob after a
 * click can be a bootstrap script rather than the document. Every blob is kept
 * and the caller picks the one with the MIME type it expects.
 */
async function armCapture(page) {
  await page.evaluate(() => {
    window.__blobs = [];
    if (!URL.__patched) {
      const orig = URL.createObjectURL;
      URL.createObjectURL = function (b) {
        if (b instanceof Blob) (window.__blobs = window.__blobs || []).push(b);
        return orig.call(URL, b);
      };
      URL.__patched = true;
    }
  });
}

async function saveCaptured(page, name, expectedType) {
  await page.waitForFunction(
    (t) => (window.__blobs || []).some(b => b.type === t),
    expectedType, { timeout: 120000 });
  const bytes = await page.evaluate(async (t) => {
    const match = window.__blobs.filter(b => b.type === t).pop();
    return Array.from(new Uint8Array(await match.arrayBuffer()));
  }, expectedType);
  const buf = Buffer.from(bytes);
  fs.writeFileSync(path.join(OUT, name), buf);
  return buf;
}

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

async function saveViaButton(page, name, file, expectedType = 'application/pdf') {
  await armCapture(page);
  await page.getByTestId('save').click();
  return saveCaptured(page, file || name, expectedType);
}
const isPdf = (b) => b.slice(0, 5).toString() === '%PDF-';
const isZip = (b) => b[0] === 0x50 && b[1] === 0x4B;

/* ── Rotate ───────────────────────────────────────────────────────────── */

test.describe('@pdf4 Rotate PDF', () => {
  test('shows a thumbnail per page for a mixed-orientation document', async ({ page }) => {
    await page.goto('/pdf-rotate/');
    await upload(page, 'mixed-orientation.pdf');
    await expect(page.getByTestId('page-grid')).toBeVisible({ timeout: 60000 });
    await expect(page.getByTestId('page-grid').locator('li')).toHaveCount(4);
    await expect(page.getByTestId('changed-count')).toContainText('No pages rotated');
  });

  test('cannot download until something is actually rotated', async ({ page }) => {
    await page.goto('/pdf-rotate/');
    await upload(page, 'mixed-orientation.pdf');
    await expect(page.getByTestId('page-grid')).toBeVisible({ timeout: 60000 });
    await expect(page.getByTestId('save')).toBeDisabled();
  });

  test('applies different rotations to different pages', async ({ page }) => {
    await page.goto('/pdf-rotate/');
    await upload(page, 'mixed-orientation.pdf');
    await expect(page.getByTestId('page-grid')).toBeVisible({ timeout: 60000 });

    await page.getByTestId('right-0').click();              // page 1 -> 90
    await page.getByTestId('left-1').click();               // page 2 -> 270
    await page.getByTestId('right-2').click();
    await page.getByTestId('right-2').click();              // page 3 -> 180
    // page 4 untouched

    await expect(page.getByTestId('page-0')).toHaveAttribute('data-rotation', '90');
    await expect(page.getByTestId('page-1')).toHaveAttribute('data-rotation', '270');
    await expect(page.getByTestId('page-2')).toHaveAttribute('data-rotation', '180');
    await expect(page.getByTestId('changed-count')).toContainText('3 of 4');

    const buf = await saveViaButton(page, 'save', 'rotated-mixed.pdf');
    expect(isPdf(buf)).toBe(true);
  });

  test('rotating all pages works', async ({ page }) => {
    await page.goto('/pdf-rotate/');
    await upload(page, 'mixed-orientation.pdf');
    await expect(page.getByTestId('page-grid')).toBeVisible({ timeout: 60000 });
    await page.getByTestId('all-right').click();
    await expect(page.getByTestId('changed-count')).toContainText('4 of 4');
    const buf = await saveViaButton(page, 'save', 'rotated-all.pdf');
    expect(isPdf(buf)).toBe(true);
  });

  test('reset clears every rotation', async ({ page }) => {
    await page.goto('/pdf-rotate/');
    await upload(page, 'mixed-orientation.pdf');
    await expect(page.getByTestId('page-grid')).toBeVisible({ timeout: 60000 });
    await page.getByTestId('all-180').click();
    await page.getByTestId('reset-all').click();
    await expect(page.getByTestId('changed-count')).toContainText('No pages rotated');
    await expect(page.getByTestId('save')).toBeDisabled();
  });
});

/* ── Sign ─────────────────────────────────────────────────────────────── */

test.describe('@pdf4 Sign PDF', () => {
  test('adds a typed signature to one page', async ({ page }) => {
    await page.goto('/pdf-sign/');
    await upload(page, 'mixed-orientation.pdf');
    await expect(page.getByTestId('sign-builder')).toBeVisible({ timeout: 60000 });
    await page.getByLabel('Your name').fill('A. Sharma');
    await expect(page.getByTestId('typed-preview')).toContainText('A. Sharma');
    const buf = await saveViaButton(page, 'save', 'signed-typed.pdf');
    expect(isPdf(buf)).toBe(true);
  });

  test('will not sign with an empty typed name', async ({ page }) => {
    await page.goto('/pdf-sign/');
    await upload(page, 'mixed-orientation.pdf');
    await expect(page.getByTestId('sign-builder')).toBeVisible({ timeout: 60000 });
    await expect(page.getByTestId('save')).toBeDisabled();
  });

  test('adds a drawn signature', async ({ page }) => {
    await page.goto('/pdf-sign/');
    await upload(page, 'mixed-orientation.pdf');
    await expect(page.getByTestId('sign-builder')).toBeVisible({ timeout: 60000 });
    await page.getByRole('button', { name: 'Draw it' }).click();

    const pad = page.getByTestId('draw-pad');
    const box = await pad.boundingBox();
    await page.mouse.move(box.x + 40, box.y + box.height * 0.6);
    await page.mouse.down();
    await page.mouse.move(box.x + 140, box.y + box.height * 0.3, { steps: 12 });
    await page.mouse.move(box.x + 240, box.y + box.height * 0.7, { steps: 12 });
    await page.mouse.move(box.x + 340, box.y + box.height * 0.35, { steps: 12 });
    await page.mouse.up();

    const buf = await saveViaButton(page, 'save', 'signed-drawn.pdf');
    expect(isPdf(buf)).toBe(true);
  });

  test('signs every page when asked', async ({ page }) => {
    await page.goto('/pdf-sign/');
    await upload(page, 'mixed-orientation.pdf');
    await expect(page.getByTestId('sign-builder')).toBeVisible({ timeout: 60000 });
    await page.getByLabel('Your name').fill('All Pages');
    await page.getByLabel('Add signature to').selectOption('all');
    const buf = await saveViaButton(page, 'save', 'signed-all.pdf');
    expect(isPdf(buf)).toBe(true);
  });

  test('signs a specific page range', async ({ page }) => {
    await page.goto('/pdf-sign/');
    await upload(page, 'mixed-orientation.pdf');
    await expect(page.getByTestId('sign-builder')).toBeVisible({ timeout: 60000 });
    await page.getByLabel('Your name').fill('Range Only');
    await page.getByLabel('Add signature to').selectOption('range');
    await page.getByLabel('Pages', { exact: true }).fill('2,4');
    const buf = await saveViaButton(page, 'save', 'signed-range.pdf');
    expect(isPdf(buf)).toBe(true);
  });
});

/* ── Redact ───────────────────────────────────────────────────────────── */

/** Drag a box over a fraction of the preview frame. */
async function dragBox(page, x0, y0, x1, y1) {
  const frame = page.getByTestId('redact-frame');
  await frame.scrollIntoViewIfNeeded();
  const b = await frame.boundingBox();
  await page.mouse.move(b.x + b.width * x0, b.y + b.height * y0);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * x1, b.y + b.height * y1, { steps: 10 });
  await page.mouse.up();
}

test.describe('@pdf4 Redact PDF', () => {
  test('draws, counts and removes redaction boxes', async ({ page }) => {
    await page.goto('/pdf-redact/');
    await upload(page, 'secrets.pdf');
    await expect(page.getByTestId('redact-frame')).toBeVisible({ timeout: 60000 });

    await dragBox(page, 0.05, 0.10, 0.60, 0.16);
    await expect(page.getByTestId('box-0')).toBeVisible();
    await dragBox(page, 0.05, 0.17, 0.60, 0.23);
    await expect(page.getByTestId('redact-count')).toContainText('2 redactions');

    await page.getByTestId('remove-1').click();
    await expect(page.getByTestId('redact-count')).toContainText('1 redaction');

    await page.getByTestId('clear-all').click();
    await expect(page.getByTestId('redact-count')).toContainText('Drag across the page');
    await expect(page.getByTestId('save')).toBeDisabled();
  });

  test('redacts across multiple pages and exports', async ({ page }) => {
    test.setTimeout(180000);
    // A tall viewport so the whole page preview is reachable. Playwright cannot
    // move the mouse outside the viewport, so on a short window a drag aimed at
    // the bottom of the page silently lands higher up — which is exactly how a
    // near-the-edge redaction can appear to be applied when it was not.
    await page.setViewportSize({ width: 1400, height: 2000 });
    await page.goto('/pdf-redact/');
    await upload(page, 'secrets.pdf');
    await expect(page.getByTestId('redact-frame')).toBeVisible({ timeout: 60000 });

    // Page 1: two secrets plus one hard against the bottom edge.
    await dragBox(page, 0.04, 0.135, 0.70, 0.185);
    await dragBox(page, 0.04, 0.170, 0.70, 0.215);
    await dragBox(page, 0.04, 0.950, 0.60, 0.995);
    await expect(page.getByTestId('box-2')).toBeVisible();   // the near-edge one really registered

    // Page 2 is landscape.
    await page.getByLabel('Page', { exact: true }).selectOption('1');
    await expect(page.getByTestId('redact-frame')).toBeVisible();
    await dragBox(page, 0.04, 0.13, 0.70, 0.22);

    // Page 3 deliberately untouched, so its text must survive.
    await expect(page.getByTestId('redact-count')).toContainText('2 pages');

    const buf = await saveViaButton(page, 'save', 'redacted.pdf');
    expect(isPdf(buf)).toBe(true);
  });
});

/* ── PDF to Excel ─────────────────────────────────────────────────────── */

test.describe('@pdf4 PDF to Excel', () => {
  test('extracts a simple table and exports a workbook', async ({ page }) => {
    await page.goto('/pdf-to-excel/');
    await upload(page, 'table-simple.pdf');
    await expect(page.getByTestId('table-summary')).toBeVisible({ timeout: 60000 });
    await expect(page.getByTestId('table-previews')).toContainText('Region');
    const buf = await saveViaButton(page, 'save', 'simple.xlsx', XLSX_MIME);
    expect(isZip(buf)).toBe(true);
  });

  test('handles a table spanning two pages', async ({ page }) => {
    await page.goto('/pdf-to-excel/');
    await upload(page, 'table-multipage.pdf');
    await expect(page.getByTestId('table-summary')).toBeVisible({ timeout: 60000 });
    const buf = await saveViaButton(page, 'save', 'multipage.xlsx', XLSX_MIME);
    expect(isZip(buf)).toBe(true);
  });

  test('keeps tables separate when joining is turned off', async ({ page }) => {
    await page.goto('/pdf-to-excel/');
    await upload(page, 'table-multipage.pdf');
    await expect(page.getByTestId('table-summary')).toBeVisible({ timeout: 60000 });
    await page.getByLabel('Join tables that continue across pages').uncheck();
    const buf = await saveViaButton(page, 'save', 'multipage-unmerged.xlsx', XLSX_MIME);
    expect(isZip(buf)).toBe(true);
  });

  test('fails honestly on a scanned PDF instead of inventing a table', async ({ page }) => {
    await page.goto('/pdf-to-excel/');
    await upload(page, 'scanned-no-text.pdf');
    await expect(page.getByTestId('no-tables')).toBeVisible({ timeout: 60000 });
    await expect(page.getByTestId('no-tables')).toContainText(/no text layer/i);
    await expect(page.getByTestId('save')).toHaveCount(0);
  });
});

/* ── Mobile ───────────────────────────────────────────────────────────── */

test.describe('@pdf4 Mobile layout', () => {
  const ROUTES = ['/pdf-rotate/', '/pdf-sign/', '/pdf-redact/', '/pdf-to-excel/'];

  for (const route of ROUTES) {
    test(`${route} has no horizontal overflow at 375px`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(route);

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        // any element sticking out past the viewport
        culprits: [...document.querySelectorAll('body *')]
          .filter(el => el.getBoundingClientRect().right > window.innerWidth + 1)
          .slice(0, 5)
          .map(el => el.tagName + '.' + (el.className || '').toString().slice(0, 40)),
      }));
      expect(overflow.culprits, `elements overflowing on ${route}`).toEqual([]);
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

      const real = errors.filter(e =>
        !e.includes('favicon') && !e.includes('ERR_BLOCKED_BY_CLIENT') && !e.includes('googletagmanager'));
      expect(real).toHaveLength(0);
    });
  }

  test('rotate controls are reachable and usable on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/pdf-rotate/');
    await page.locator('input[type="file"]').setInputFiles(fx('mixed-orientation.pdf'));
    await expect(page.getByTestId('page-grid')).toBeVisible({ timeout: 60000 });

    // The per-page rotate buttons must be tappable, not clipped or overlapped.
    const btn = page.getByTestId('right-0');
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(28);
    expect(box.height).toBeGreaterThanOrEqual(28);
    await btn.click();
    await expect(page.getByTestId('page-0')).toHaveAttribute('data-rotation', '90');
  });

  test('redaction can be drawn with touch coordinates on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/pdf-redact/');
    await page.locator('input[type="file"]').setInputFiles(fx('secrets.pdf'));
    await expect(page.getByTestId('redact-frame')).toBeVisible({ timeout: 60000 });
    await dragBox(page, 0.1, 0.12, 0.7, 0.18);
    await expect(page.getByTestId('box-0')).toBeVisible();
    await expect(page.getByTestId('save')).toBeEnabled();
  });
});

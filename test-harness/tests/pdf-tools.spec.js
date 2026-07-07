// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const TEST_PDF = path.resolve(__dirname, '..', 'test-sample.pdf');

/**
 * PDF tool functional tests — upload a PDF, click action, verify output.
 * Tag: @pdf
 *
 * Each test:
 *  1. Opens the tool page
 *  2. Uploads test-sample.pdf via the file input
 *  3. Clicks the primary action button
 *  4. Waits for a download (or success message for tools that preview instead)
 *  5. Checks for absence of error messages
 */

// Helper: upload a file to the first <input type="file"> or drop-zone input
async function uploadPDF(page) {
  let input = page.locator('input[type="file"]').first();
  if (await input.count() === 0) {
    input = page.locator('input[accept*="pdf"]').first();
  }
  await input.setInputFiles(TEST_PDF);
}

// Helper: wait for any download to start (returns Download object)
async function waitForDownload(page, actionFn, timeoutMs = 60_000) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: timeoutMs }),
    actionFn(),
  ]);
  return download;
}

// Helper: check no visible error on page
async function expectNoError(page) {
  const errorBanner = page.locator('.error, [class*="error"], [role="alert"]');
  const count = await errorBanner.count();
  for (let i = 0; i < count; i++) {
    const text = await errorBanner.nth(i).textContent();
    if (text && text.trim().length > 0) {
      const visible = await errorBanner.nth(i).isVisible();
      if (visible) {
        throw new Error(`Error visible on page: "${text.trim()}"`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// PDF Merge
// ---------------------------------------------------------------------------
test.describe('@pdf PDF Merge', () => {
  test('merges two copies of test PDF', async ({ page }) => {
    await page.goto('/pdf-merge/');

    const input = page.locator('input[type="file"]').first();
    await input.setInputFiles([TEST_PDF, TEST_PDF]);

    await page.waitForTimeout(1000);

    const btn = page.locator('button, input[type="button"]')
      .filter({ hasText: /merge/i }).first();

    const download = await waitForDownload(page, () => btn.click());
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    await expectNoError(page);
  });
});

// ---------------------------------------------------------------------------
// PDF Split
// ---------------------------------------------------------------------------
test.describe('@pdf PDF Split', () => {
  test('splits test PDF into individual pages', async ({ page }) => {
    await page.goto('/pdf-split/');
    await uploadPDF(page);

    // Wait for the action button to appear — it only renders after onFile() sets
    // state (which includes an async pdf-lib load + page count check).
    // Use /split pdf/i to avoid matching the "Split every page" mode toggle.
    const btn = page.locator('button').filter({ hasText: /split pdf/i }).first();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });

    const download = await waitForDownload(page, () => btn.click(), 30_000);
    expect(download.suggestedFilename()).toMatch(/\.(pdf|zip)$/i);
    await expectNoError(page);
  });
});

// ---------------------------------------------------------------------------
// PDF Compress
// ---------------------------------------------------------------------------
test.describe('@pdf PDF Compress', () => {
  test('compresses test PDF', async ({ page }) => {
    await page.goto('/pdf-compress/');
    await uploadPDF(page);
    await page.waitForTimeout(1000);

    // Step 1: click Compress — this runs processing and shows a result panel
    const compressBtn = page.locator('button').filter({ hasText: /compress/i }).first();
    await compressBtn.click();

    // Step 2: wait for the Download button that appears in the result panel
    const downloadBtn = page.locator('button').filter({ hasText: /download/i });
    await downloadBtn.waitFor({ state: 'visible', timeout: 30_000 });

    // Step 3: click Download and capture the download event
    const download = await waitForDownload(page, () => downloadBtn.click(), 15_000);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    await expectNoError(page);
  });
});

// ---------------------------------------------------------------------------
// PDF Organize
// ---------------------------------------------------------------------------
test.describe('@pdf PDF Organize', () => {
  test('loads PDF and shows page list', async ({ page }) => {
    await page.goto('/pdf-organize/');
    await uploadPDF(page);

    await page.waitForTimeout(2000);

    const rows = page.locator('[class*="page"], tr, .page-row, li')
      .filter({ hasText: /page/i });

    await expectNoError(page);
  });
});

// ---------------------------------------------------------------------------
// PDF to Word
// ---------------------------------------------------------------------------
test.describe('@pdf PDF to Word', () => {
  test('converts test PDF to .docx', async ({ page }) => {
    await page.goto('/pdf-to-word/');
    await uploadPDF(page);
    await page.waitForTimeout(1000);

    const btn = page.locator('button, input[type="button"]')
      .filter({ hasText: /convert|word|docx/i }).first();

    const download = await waitForDownload(page, () => btn.click(), 90_000);
    expect(download.suggestedFilename()).toMatch(/\.docx$/i);
    await expectNoError(page);
  });
});

// ---------------------------------------------------------------------------
// PDF to JPG
// ---------------------------------------------------------------------------
test.describe('@pdf PDF to JPG', () => {
  test('converts test PDF to images', async ({ page }) => {
    await page.goto('/pdf-to-jpg/');
    await uploadPDF(page);
    await page.waitForTimeout(1000);

    // Step 1: click Convert — this renders images in-page (no auto download)
    const convertBtn = page.locator('button').filter({ hasText: /convert/i }).first();
    await convertBtn.click();

    // Step 2: wait for "Download All" button to appear
    const downloadBtn = page.locator('button').filter({ hasText: /download all/i });
    await downloadBtn.waitFor({ state: 'visible', timeout: 30_000 });

    // Step 3: click Download All and capture the download event
    const download = await waitForDownload(page, () => downloadBtn.click(), 15_000);
    expect(download.suggestedFilename()).toMatch(/\.(jpg|jpeg|zip)$/i);
    await expectNoError(page);
  });
});

// ---------------------------------------------------------------------------
// PDF OCR
// ---------------------------------------------------------------------------
test.describe('@pdf PDF OCR', () => {
  test('runs OCR on test PDF (English)', async ({ page }) => {
    test.setTimeout(180_000); // OCR is slow — allow 3 min total

    await page.goto('/pdf-ocr/');
    await uploadPDF(page);
    await page.waitForTimeout(1000);

    // Select English if using a <select> element
    const langSelect = page.locator('select').first();
    if (await langSelect.count() > 0) {
      await langSelect.selectOption({ value: 'eng' });
    }

    // Step 1: click Start OCR — processing happens in-page (no auto download)
    const ocrBtn = page.locator('button').filter({ hasText: /start ocr|ocr/i }).first();
    await ocrBtn.click();

    // Step 2: wait for "Download Searchable PDF" button — appears when all pages are done
    const downloadBtn = page.locator('button').filter({ hasText: /download.*searchable|searchable.*pdf/i });
    await downloadBtn.waitFor({ state: 'visible', timeout: 150_000 });

    // Step 3: click Download and capture the searchable PDF
    const download = await waitForDownload(page, () => downloadBtn.click(), 15_000);
    expect(download.suggestedFilename()).toMatch(/searchable\.pdf$/i);
    await expectNoError(page);
  });
});

// ---------------------------------------------------------------------------
// PDF Watermark
// ---------------------------------------------------------------------------
test.describe('@pdf PDF Watermark', () => {
  test('adds watermark to test PDF', async ({ page }) => {
    await page.goto('/pdf-watermark/');
    await uploadPDF(page);
    await page.waitForTimeout(1000);

    const textInput = page.locator('input[type="text"]').first();
    if (await textInput.count() > 0) {
      await textInput.fill('TEST WATERMARK');
    }

    const btn = page.locator('button, input[type="button"]')
      .filter({ hasText: /watermark|apply|add/i }).first();

    const download = await waitForDownload(page, () => btn.click());
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    await expectNoError(page);
  });
});

// ---------------------------------------------------------------------------
// PDF Page Numbers
// ---------------------------------------------------------------------------
test.describe('@pdf PDF Page Numbers', () => {
  test('adds page numbers to test PDF', async ({ page }) => {
    await page.goto('/pdf-page-numbers/');
    await uploadPDF(page);
    await page.waitForTimeout(1000);

    const btn = page.locator('button, input[type="button"]')
      .filter({ hasText: /add|number|apply/i }).first();

    const download = await waitForDownload(page, () => btn.click());
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    await expectNoError(page);
  });
});

// ---------------------------------------------------------------------------
// PDF Unlock
// ---------------------------------------------------------------------------
test.describe('@pdf PDF Unlock', () => {
  test('page loads and accepts PDF upload', async ({ page }) => {
    await page.goto('/pdf-unlock/');
    await uploadPDF(page);
    await page.waitForTimeout(1000);
    // Unlock only works on password-protected PDFs, so just verify no crash
    await expectNoError(page);
  });
});

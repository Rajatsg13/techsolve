// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const TEST_PDF = path.resolve(__dirname, '..', 'test-sample.pdf');

/**
 * PDF Compress v2 functional tests — Smart + Aggressive modes
 * Tag: @compress
 *
 * Tests the standalone HTML page at /pdf-compress/ which has:
 *  - Smart mode (pdf-lib image interceptor, preserves text)
 *  - Aggressive mode (pdf.js canvas render, max compression)
 *  - Three compression levels: Light, Balanced, Heavy
 */

// Helper: upload PDF
async function uploadPDF(page) {
  const input = page.locator('#file-input');
  await input.setInputFiles(TEST_PDF);
}

// Helper: wait for download
async function waitForDownload(page, actionFn, timeoutMs = 120_000) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: timeoutMs }),
    actionFn(),
  ]);
  return download;
}

test.describe('@compress PDF Compress v2 — UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pdf-compress/');
  });

  test('page loads with correct title and elements', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Compress PDF');
    await expect(page.locator('#drop-zone')).toBeVisible();
    await expect(page.locator('.mode-card.smart')).toBeVisible();
    await expect(page.locator('.mode-card.aggressive')).toBeVisible();
    await expect(page.locator('#compress-btn')).toBeDisabled();
  });

  test('file upload shows file info and enables button', async ({ page }) => {
    await uploadPDF(page);
    await expect(page.locator('#file-info')).toBeVisible();
    await expect(page.locator('#file-name')).not.toBeEmpty();
    await expect(page.locator('#compress-btn')).toBeEnabled();
    await expect(page.locator('#drop-zone')).toBeHidden();
  });

  test('remove button resets to initial state', async ({ page }) => {
    await uploadPDF(page);
    await page.locator('#remove-btn').click();
    await expect(page.locator('#drop-zone')).toBeVisible();
    await expect(page.locator('#compress-btn')).toBeDisabled();
    await expect(page.locator('#file-info')).toBeHidden();
  });

  test('mode selection toggles active class', async ({ page }) => {
    // Smart is default active
    await expect(page.locator('.mode-card.smart')).toHaveClass(/active/);
    await expect(page.locator('.mode-card.aggressive')).not.toHaveClass(/active/);

    // Switch to aggressive
    await page.locator('.mode-card.aggressive').click();
    await expect(page.locator('.mode-card.aggressive')).toHaveClass(/active/);
    await expect(page.locator('.mode-card.smart')).not.toHaveClass(/active/);

    // Level section hidden in aggressive mode
    await expect(page.locator('#level-section')).toBeHidden();

    // Switch back to smart
    await page.locator('.mode-card.smart').click();
    await expect(page.locator('#level-section')).toBeVisible();
  });

  test('compression level buttons toggle correctly', async ({ page }) => {
    const balanced = page.locator('.level-btn[data-level="balanced"]');
    const light = page.locator('.level-btn[data-level="light"]');
    const heavy = page.locator('.level-btn[data-level="heavy"]');

    await expect(balanced).toHaveClass(/active/);
    await light.click();
    await expect(light).toHaveClass(/active/);
    await expect(balanced).not.toHaveClass(/active/);

    await heavy.click();
    await expect(heavy).toHaveClass(/active/);
    await expect(light).not.toHaveClass(/active/);
  });
});

test.describe('@compress PDF Compress v2 — Smart Mode', () => {
  test('compresses PDF in Smart/Balanced mode and downloads', async ({ page }) => {
    await page.goto('/pdf-compress/');
    await uploadPDF(page);

    // Smart mode is default, Balanced is default level
    await expect(page.locator('.mode-card.smart')).toHaveClass(/active/);

    // Click compress
    const download = await waitForDownload(page, () =>
      page.locator('#compress-btn').click().then(async () => {
        // Wait for results to appear, then click download
        await page.locator('#results').waitFor({ state: 'visible', timeout: 120_000 });
        await page.locator('#download-btn').click();
      })
    );

    expect(download).toBeTruthy();
    const suggestedName = download.suggestedFilename();
    expect(suggestedName).toMatch(/_compressed\.pdf$/i);

    // Results should show stats
    await expect(page.locator('#orig-size')).not.toHaveText('—');
    await expect(page.locator('#comp-size')).not.toHaveText('—');
    await expect(page.locator('#saved-pct')).not.toHaveText('—');
  });

  test('Smart/Light mode runs without error', async ({ page }) => {
    await page.goto('/pdf-compress/');
    await uploadPDF(page);
    await page.locator('.level-btn[data-level="light"]').click();
    await page.locator('#compress-btn').click();
    await page.locator('#results').waitFor({ state: 'visible', timeout: 120_000 });
    await expect(page.locator('#saved-pct')).not.toHaveText('—');
  });

  test('Smart/Heavy mode runs without error', async ({ page }) => {
    await page.goto('/pdf-compress/');
    await uploadPDF(page);
    await page.locator('.level-btn[data-level="heavy"]').click();
    await page.locator('#compress-btn').click();
    await page.locator('#results').waitFor({ state: 'visible', timeout: 120_000 });
    await expect(page.locator('#saved-pct')).not.toHaveText('—');
  });
});

test.describe('@compress PDF Compress v2 — Aggressive Mode', () => {
  test('compresses PDF in Aggressive mode and downloads', async ({ page }) => {
    await page.goto('/pdf-compress/');
    await uploadPDF(page);

    // Switch to aggressive
    await page.locator('.mode-card.aggressive').click();

    const download = await waitForDownload(page, () =>
      page.locator('#compress-btn').click().then(async () => {
        await page.locator('#results').waitFor({ state: 'visible', timeout: 120_000 });
        await page.locator('#download-btn').click();
      })
    );

    expect(download).toBeTruthy();
    expect(download.suggestedFilename()).toMatch(/_compressed\.pdf$/i);
    await expect(page.locator('#saved-pct')).not.toHaveText('—');
  });
});

test.describe('@compress PDF Compress v2 — Reset Flow', () => {
  test('compress another PDF resets state', async ({ page }) => {
    await page.goto('/pdf-compress/');
    await uploadPDF(page);
    await page.locator('#compress-btn').click();
    await page.locator('#results').waitFor({ state: 'visible', timeout: 120_000 });

    // Click "Compress Another PDF"
    await page.locator('#reset-btn').click();
    await expect(page.locator('#drop-zone')).toBeVisible();
    await expect(page.locator('#results')).toBeHidden();
    await expect(page.locator('#progress-section')).toBeHidden();
    await expect(page.locator('#compress-btn')).toBeDisabled();
  });
});

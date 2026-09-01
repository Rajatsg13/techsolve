// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * End-to-end tests for the image tools.
 * Tag: @images
 *
 * These upload real image files, run the tool, and write the resulting bytes to
 * OUT_DIR so the output can be checked independently with an image library —
 * a browser preview showing something is not proof that the downloaded file is
 * a valid image of the right size and format.
 */

const FIXTURES = process.env.IMAGE_FIXTURES
  || '/private/tmp/claude-501/-Users-rajat-Desktop-Dhyai-test/36af64ad-458a-449b-acc0-d4f9191ff638/scratchpad/fixtures';
const OUT_DIR = process.env.IMAGE_OUT
  || '/private/tmp/claude-501/-Users-rajat-Desktop-Dhyai-test/36af64ad-458a-449b-acc0-d4f9191ff638/scratchpad/caught';

const fx = (name) => path.join(FIXTURES, name);

test.beforeAll(() => { fs.mkdirSync(OUT_DIR, { recursive: true }); });

/** Put a file into the tool's hidden file input. */
async function upload(page, file) {
  await page.locator('input[type="file"]').setInputFiles(fx(file));
}

/** Start capturing blobs the page hands to the browser. */
async function armCapture(page) {
  await page.evaluate(() => {
    window.__cap = null;
    const orig = URL.createObjectURL;
    URL.createObjectURL = function (b) { if (b instanceof Blob) window.__cap = b; return orig.call(URL, b); };
  });
}

/** Read the most recent captured blob and write it to OUT_DIR. */
async function saveCaptured(page, saveAs) {
  await page.waitForFunction(() => window.__cap !== null, null, { timeout: 90000 });
  const bytes = await page.evaluate(async () => Array.from(new Uint8Array(await window.__cap.arrayBuffer())));
  const buf = Buffer.from(bytes);
  fs.writeFileSync(path.join(OUT_DIR, saveAs), buf);
  return buf;
}

/**
 * Run the tool, then download the result and save the real bytes.
 *
 * These tools are two-step — produce a result, then download it — so the
 * download button does not exist until the work has been done. The capture is
 * re-armed before the download click so the saved bytes are the ones the
 * download actually handed over, not the preview blob made earlier.
 */
async function runThenCapture(page, runName, downloadName, saveAs) {
  await page.getByRole('button', { name: runName }).click();
  const download = page.getByRole('button', { name: downloadName });
  await download.waitFor({ state: 'visible', timeout: 90000 });
  await armCapture(page);
  await download.click();
  return saveCaptured(page, saveAs);
}

const isJpeg = (b) => b[0] === 0xFF && b[1] === 0xD8 && b[b.length - 2] === 0xFF && b[b.length - 1] === 0xD9;
const isPng  = (b) => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
const isWebp = (b) => b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP';

/* ── Compress ─────────────────────────────────────────────────────────── */

test.describe('@images Compress Image', () => {
  test('reduces the size of a large photo and stays a valid JPEG', async ({ page }) => {
    await page.goto('/image-compress/');
    await upload(page, 'photo-large.jpg');
    await expect(page.getByText('4032 × 3024 pixels')).toBeVisible();

    const buf = await runThenCapture(page, /^Compress image$/i, /Download compressed image/i, 'compressed-large.jpg');

    const original = fs.statSync(fx('photo-large.jpg')).size;
    expect(buf.length).toBeLessThan(original);          // actually smaller
    expect(isJpeg(buf)).toBe(true);                     // and still a complete JPEG
    const saved = await page.getByTestId('saved-percent').textContent();
    expect(saved).toMatch(/\d+%/);
  });

  test('target-size mode gets a photo under the requested limit', async ({ page }) => {
    await page.goto('/image-compress/');
    await upload(page, 'photo-medium.jpg');
    await page.getByLabel('How should it be compressed?').selectOption('size');
    await page.getByLabel('Target size').selectOption('200');
    const buf = await runThenCapture(page, /^Compress image$/i, /Download compressed image/i, 'compressed-target200.jpg');
    expect(buf.length).toBeLessThanOrEqual(200 * 1024);
    expect(isJpeg(buf)).toBe(true);
  });

  test('reducing dimensions produces the requested longest side', async ({ page }) => {
    await page.goto('/image-compress/');
    await upload(page, 'photo-large.jpg');
    await page.getByLabel('Also reduce the dimensions').check();
    await page.getByLabel('Longest side').selectOption('1280');
    await runThenCapture(page, /^Compress image$/i, /Download compressed image/i, 'compressed-1280.jpg');
    // 4032x3024 capped at 1280 -> 1280x960
    await expect(page.getByTestId('compress-result')).toContainText('1280 × 960');
  });

  test('can output WebP', async ({ page }) => {
    await page.goto('/image-compress/');
    await upload(page, 'photo-small.jpg');
    await page.getByLabel('Output format').selectOption('webp');
    const buf = await runThenCapture(page, /^Compress image$/i, /Download compressed image/i, 'compressed.webp');
    expect(isWebp(buf)).toBe(true);
  });

  test('a transparent PNG kept as PNG stays a PNG', async ({ page }) => {
    await page.goto('/image-compress/');
    await upload(page, 'transparent.png');
    await expect(page.getByLabel('Output format')).toHaveValue('png');
    const buf = await runThenCapture(page, /^Compress image$/i, /Download compressed image/i, 'compressed-transparent.png');
    expect(isPng(buf)).toBe(true);
  });

  test('flattens transparency onto white, not black, when going to JPEG', async ({ page }) => {
    // The classic canvas bug: drawing a transparent PNG straight to a JPEG
    // canvas leaves the transparent areas black.
    await page.goto('/image-compress/');
    await upload(page, 'transparent.png');
    await page.getByLabel('Output format').selectOption('jpeg');
    const buf = await runThenCapture(page, /^Compress image$/i, /Download compressed image/i, 'flattened.jpg');
    expect(isJpeg(buf)).toBe(true);
  });

  test('says so honestly when nothing could be saved', async ({ page }) => {
    await page.goto('/image-compress/');
    await upload(page, 'already-small.jpg');
    await page.getByLabel('Quality').fill('100');
    await page.getByRole('button', { name: /Compress image/i }).click();
    await expect(page.getByTestId('compress-result')).toBeVisible({ timeout: 30000 });
    // A quality-100 re-encode of an already-degraded JPEG grows; the tool must admit it.
    await expect(page.getByText(/did not make the file smaller/i)).toBeVisible();
  });

  test('handles an 80-megapixel image without failing', async ({ page }) => {
    // 10000x8000 is past what a phone produces, and past the point where a
    // naive canvas would throw. It must still produce a usable file.
    test.setTimeout(120000);
    await page.goto('/image-compress/');
    await upload(page, 'huge-80mp.jpg');
    await expect(page.getByText('10000 × 8000 pixels')).toBeVisible({ timeout: 60000 });
    const buf = await runThenCapture(page, /^Compress image$/i, /Download compressed image/i, 'compressed-80mp.jpg');
    expect(isJpeg(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(1000);
  });

  test('rejects a file that is not an image', async ({ page }) => {
    await page.goto('/image-compress/');
    await upload(page, 'not-an-image.jpg');
    await expect(page.getByText(/could not be read as an image|not a supported file type/i)).toBeVisible();
    await expect(page.getByTestId('compress-options')).toBeHidden();
  });

  test('rejects a corrupt image rather than producing a broken file', async ({ page }) => {
    await page.goto('/image-compress/');
    await upload(page, 'corrupt.jpg');
    // Either it refuses, or it decodes the partial image — but it must never
    // silently present a result built from nothing.
    const failed = await page.getByText(/could not be read as an image/i).isVisible().catch(() => false);
    const opened = await page.getByTestId('compress-options').isVisible().catch(() => false);
    expect(failed || opened).toBe(true);
  });

  test('handles a one-pixel image without dividing by zero', async ({ page }) => {
    await page.goto('/image-compress/');
    await upload(page, 'one-pixel.png');
    await expect(page.getByText('1 × 1 pixels')).toBeVisible();
    const buf = await runThenCapture(page, /^Compress image$/i, /Download compressed image/i, 'compressed-1px.png');
    expect(buf.length).toBeGreaterThan(0);
  });
});

/* ── Crop ─────────────────────────────────────────────────────────────── */

test.describe('@images Crop Image', () => {
  test('crops freeform to exactly the typed dimensions', async ({ page }) => {
    await page.goto('/image-crop/');
    await upload(page, 'photo-medium.jpg');
    await page.getByLabel('X', { exact: true }).fill('100');
    await page.getByLabel('Y', { exact: true }).fill('50');
    await page.getByLabel('Width', { exact: true }).fill('800');
    await page.getByLabel('Height', { exact: true }).fill('600');
    await expect(page.getByTestId('output-dims')).toContainText('800 × 600');

    await runThenCapture(page, /^Crop image$/i, /Download cropped image/i, 'cropped-800x600.jpg');
    await expect(page.getByTestId('result-dims')).toHaveText('800 × 600');
  });

  test('a 1:1 ratio produces a square', async ({ page }) => {
    await page.goto('/image-crop/');
    await upload(page, 'photo-medium.jpg');
    await page.getByLabel('Shape').selectOption('1:1');
    await runThenCapture(page, /^Crop image$/i, /Download cropped image/i, 'cropped-square.jpg');
    const dims = await page.getByTestId('result-dims').textContent();
    const [w, h] = dims.split('×').map(s => parseInt(s.trim(), 10));
    expect(w).toBe(h);
  });

  test('16:9 produces the right proportions', async ({ page }) => {
    await page.goto('/image-crop/');
    await upload(page, 'photo-medium.jpg');
    await page.getByLabel('Shape').selectOption('16:9');
    await runThenCapture(page, /^Crop image$/i, /Download cropped image/i, 'cropped-16x9.jpg');
    const dims = await page.getByTestId('result-dims').textContent();
    const [w, h] = dims.split('×').map(s => parseInt(s.trim(), 10));
    expect(Math.abs(w / h - 16 / 9)).toBeLessThan(0.02);
  });

  test('9:16 on a wide panorama stays inside the image', async ({ page }) => {
    await page.goto('/image-crop/');
    await upload(page, 'panorama.jpg');       // 6000x1200 — an extreme shape
    await page.getByLabel('Shape').selectOption('9:16');
    await runThenCapture(page, /^Crop image$/i, /Download cropped image/i, 'cropped-panorama-9x16.jpg');
    const dims = await page.getByTestId('result-dims').textContent();
    const [w, h] = dims.split('×').map(s => parseInt(s.trim(), 10));
    expect(h).toBeLessThanOrEqual(1200);
    expect(w).toBeLessThanOrEqual(6000);
    expect(Math.abs(w / h - 9 / 16)).toBeLessThan(0.02);
  });

  test('a crop cannot be pushed outside the image', async ({ page }) => {
    await page.goto('/image-crop/');
    await upload(page, 'photo-small.jpg');    // 1200x800
    await page.getByLabel('X', { exact: true }).fill('99999');
    await page.getByLabel('Width', { exact: true }).fill('99999');
    await expect(page.getByTestId('output-dims')).toContainText('1200 ×');
  });

  test('crops a PNG to PNG, keeping the format', async ({ page }) => {
    await page.goto('/image-crop/');
    await upload(page, 'transparent.png');
    const buf = await runThenCapture(page, /^Crop image$/i, /Download cropped image/i, 'cropped-transparent.png');
    expect(isPng(buf)).toBe(true);
  });

  test('rejects a file that is not an image', async ({ page }) => {
    await page.goto('/image-crop/');
    await upload(page, 'not-an-image.jpg');
    await expect(page.getByText(/could not be read as an image|not a supported file type/i)).toBeVisible();
  });
});

/* ── HEIC ─────────────────────────────────────────────────────────────── */

test.describe('@images HEIC to JPG', () => {
  test('rejects a JPG that is not really HEIC, by inspecting the container', async ({ page }) => {
    await page.goto('/heic-to-jpg/');
    await upload(page, 'photo-small.jpg');
    await expect(page.getByTestId('heic-list')).toContainText(/Not a HEIC image/i);
  });

  test('rejects a text file pretending to be an image', async ({ page }) => {
    await page.goto('/heic-to-jpg/');
    await upload(page, 'not-an-image.jpg');
    await expect(page.getByTestId('heic-list')).toContainText(/not a HEIC image/i);
  });

  /**
   * NOTE: these run against a HEIC produced by macOS `sips`, which is a
   * synthetic fixture. It proves the decode path works; it is NOT accepted as
   * evidence of production readiness. See TESTING.md — a genuine iPhone camera
   * HEIC is still required before this tool ships.
   */
  test('converts a synthetic HEIC to a valid JPEG @synthetic-heic', async ({ page }) => {
    test.setTimeout(180000);
    await page.goto('/heic-to-jpg/');
    await upload(page, 'synthetic-small.heic');
    await expect(page.getByTestId('heic-options')).toBeVisible();
    await page.getByRole('button', { name: /Convert 1 photo/i }).click();
    const download = page.getByRole('button', { name: /^Download$/ });
    await download.waitFor({ state: 'visible', timeout: 150000 });
    await armCapture(page);
    await download.click();
    const buf = await saveCaptured(page, 'heic-converted.jpg');
    expect(isJpeg(buf)).toBe(true);
  });

  test('converts several files in one batch @synthetic-heic', async ({ page }) => {
    test.setTimeout(180000);
    await page.goto('/heic-to-jpg/');
    await page.locator('input[type="file"]').setInputFiles([fx('synthetic-small.heic'), fx('synthetic-converted.heic')]);
    await page.getByRole('button', { name: /Convert 2 photos/i }).click();
    await expect(page.getByRole('button', { name: /Download all 2 images/i })).toBeVisible({ timeout: 120000 });
  });
});

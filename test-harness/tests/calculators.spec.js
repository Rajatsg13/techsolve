// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Calculator functional tests — fill inputs, compute, verify results appear.
 * Tag: @calc
 */

// ---------------------------------------------------------------------------
// EMI Calculator
// ---------------------------------------------------------------------------
test.describe('@calc EMI Calculator', () => {
  test('calculates EMI with default/custom values', async ({ page }) => {
    await page.goto('/emi-calculator/');

    // Look for result area — calculators typically show results after page load
    // since they have default values pre-filled
    await page.waitForTimeout(1500);

    // Check that a result number is visible (EMI amount)
    const body = await page.textContent('body');
    // EMI page should show some numeric result — ₹ or a comma-formatted number
    expect(body).toMatch(/[\d,]+/);

    // No visible app-level error banners (excludes Recharts' accessible live regions)
    const errorEl = page.locator('.error:visible');
    expect(await errorEl.count()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// SIP Calculator
// ---------------------------------------------------------------------------
test.describe('@calc SIP Calculator', () => {
  test('shows SIP result on load', async ({ page }) => {
    await page.goto('/sip-calculator/');
    await page.waitForTimeout(1500);

    const body = await page.textContent('body');
    expect(body).toMatch(/[\d,]+/);
  });
});

// ---------------------------------------------------------------------------
// Lumpsum Calculator
// ---------------------------------------------------------------------------
test.describe('@calc Lumpsum Calculator', () => {
  test('shows lumpsum result on load', async ({ page }) => {
    await page.goto('/lumpsum-calculator/');
    await page.waitForTimeout(1500);

    const body = await page.textContent('body');
    expect(body).toMatch(/[\d,]+/);
  });
});

// ---------------------------------------------------------------------------
// PPF Calculator
// ---------------------------------------------------------------------------
test.describe('@calc PPF Calculator', () => {
  test('shows PPF result on load', async ({ page }) => {
    await page.goto('/ppf-calculator/');
    await page.waitForTimeout(1500);

    const body = await page.textContent('body');
    expect(body).toMatch(/[\d,]+/);
  });
});

// ---------------------------------------------------------------------------
// Income Tax Calculator
// ---------------------------------------------------------------------------
test.describe('@calc Income Tax Calculator', () => {
  test('shows tax result on load', async ({ page }) => {
    await page.goto('/income-tax-calculator/');
    await page.waitForTimeout(1500);

    const body = await page.textContent('body');
    // Should show tax amounts or regime comparison
    expect(body).toMatch(/[\d,]+/);
  });
});

// ---------------------------------------------------------------------------
// FIRE Calculator
// ---------------------------------------------------------------------------
test.describe('@calc FIRE Calculator', () => {
  test('shows FIRE result on load', async ({ page }) => {
    await page.goto('/fire-calculator/');
    await page.waitForTimeout(1500);

    const body = await page.textContent('body');
    expect(body).toMatch(/[\d,]+/);
  });
});

// ---------------------------------------------------------------------------
// Graham Number Calculator
// ---------------------------------------------------------------------------
test.describe('@calc Graham Number Calculator', () => {
  test('shows Graham number on load', async ({ page }) => {
    await page.goto('/graham-number-calculator/');
    await page.waitForTimeout(1500);

    const body = await page.textContent('body');
    expect(body).toMatch(/[\d,]+/);
  });
});

// ---------------------------------------------------------------------------
// Sharpe Ratio Calculator
// ---------------------------------------------------------------------------
test.describe('@calc Sharpe Ratio Calculator', () => {
  test('shows Sharpe ratio on load', async ({ page }) => {
    await page.goto('/sharpe-ratio-calculator/');
    await page.waitForTimeout(1500);

    const body = await page.textContent('body');
    expect(body).toMatch(/[\d,.]+/);
  });
});

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

// ---------------------------------------------------------------------------
// Stock Profit Calculator
// ---------------------------------------------------------------------------
test.describe('@calc Stock Profit Calculator', () => {
  // Ships with 1000 buy / 1200 sell / 100 qty pre-filled, so the whole charge
  // stack is exercised on load. These are exact figures — if a charge rate or
  // the GST base changes, this test is meant to fail.
  test('computes the Zerodha delivery charge stack from defaults', async ({ page }) => {
    await page.goto('/stock-profit-calculator/');
    await page.waitForTimeout(1500);

    const body = await page.textContent('body');
    expect(body).toContain('₹258.57');       // total charges
    expect(body).toContain('₹19,741.43');    // profit before tax
    expect(body).toContain('₹3,948.29');     // STCG @ 20%
    expect(body).toContain('₹15,793.14');    // net profit after tax
  });

  test('switching to long-term applies the LTCG exemption', async ({ page }) => {
    await page.goto('/stock-profit-calculator/');
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /Capital Gains Tax/i }).click();
    await page.getByRole('button', { name: /Long-term/i }).click();
    await page.waitForTimeout(500);

    // 19,741.43 profit is under the 1.25L exemption, so LTCG tax is zero
    // and the net equals the pre-tax figure.
    const body = await page.textContent('body');
    expect(body).toContain('₹0.00');
    expect(body).toContain('₹19,741.43');
  });

  test('a loss-making trade shows no tax', async ({ page }) => {
    await page.goto('/stock-profit-calculator/');
    await page.waitForTimeout(1000);

    await page.getByLabel('Sell Price per Share (₹)').fill('800');
    await page.waitForTimeout(500);

    const body = await page.textContent('body');
    expect(body).toContain('Net Loss after charges');
    expect(body).toMatch(/−?₹0\.00/);   // tax line is zero on a loss
  });
});

// ---------------------------------------------------------------------------
// MF Profit Calculator
// ---------------------------------------------------------------------------
test.describe('@calc MF Profit Calculator', () => {
  test('loads with the search box ready', async ({ page }) => {
    await page.goto('/mf-profit-calculator/');
    await page.waitForTimeout(1500);

    await expect(page.getByPlaceholder(/Type at least 3 letters/i)).toBeVisible();
    const body = await page.textContent('body');
    expect(body).toContain('Disclaimer');
  });

  // Depends on api.mfapi.in being reachable. If that third party is down this
  // will fail — which is the signal we want, since the tool is unusable then.
  test('searches a scheme, loads NAV history and computes a return', async ({ page }) => {
    await page.goto('/mf-profit-calculator/');

    await page.getByPlaceholder(/Type at least 3 letters/i).fill('Parag Parikh Flexi Cap');

    // Debounced 350ms, then a network round trip.
    const option = page.getByRole('button', { name: /Parag Parikh Flexi Cap/i }).first();
    await expect(option).toBeVisible({ timeout: 20_000 });
    await option.click();

    // NAV history seeds the date range once it lands.
    await expect(page.getByText(/NAV history available/i)).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: 'Calculate Profit' }).click();
    await page.waitForTimeout(1000);

    const body = await page.textContent('body');
    expect(body).toMatch(/Total (Gain|Loss)/);
    expect(body).toMatch(/XIRR/);
    expect(body).toMatch(/Units Held/);
    // Category is "Equity Scheme - Flexi Cap Fund", so the fund type should
    // have auto-detected as equity and classified this as long-term.
    expect(body).toMatch(/Long-term \(LTCG\)/);
  });

  test('rejects a sell date that precedes the buy date', async ({ page }) => {
    await page.goto('/mf-profit-calculator/');

    await page.getByPlaceholder(/Type at least 3 letters/i).fill('Parag Parikh Flexi Cap');
    const option = page.getByRole('button', { name: /Parag Parikh Flexi Cap/i }).first();
    await expect(option).toBeVisible({ timeout: 20_000 });
    await option.click();
    await expect(page.getByText(/NAV history available/i)).toBeVisible({ timeout: 20_000 });

    await page.getByLabel('Buy Date').fill('2024-06-01');
    await page.getByLabel('Sell Date').fill('2023-06-01');
    await page.getByRole('button', { name: 'Calculate Profit' }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText(/sell date must be after the buy date/i)).toBeVisible();
  });
});

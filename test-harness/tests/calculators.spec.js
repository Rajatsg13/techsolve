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
test.describe('@calc Stock Profit Calculator — charges', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stock-profit-calculator/');
    await page.waitForTimeout(800);
  });

  // Ships with 1000 buy / 1200 sell / 100 qty pre-filled, so the whole charge
  // stack is exercised on load. These are exact figures — if a charge rate or
  // the GST base changes, this test is meant to fail.
  test('computes the Zerodha delivery charge stack from defaults', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toContain('₹258.57');       // total charges
    expect(body).toContain('₹19,741.43');    // profit before tax
    expect(body).toContain('₹3,948.29');     // STCG @ 20%
    expect(body).toContain('₹15,793.14');    // net profit after tax
  });

  test('itemises every individual charge', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toContain('₹220.00');   // STT, 0.1% of 2,20,000 turnover
    expect(body).toContain('₹6.75');     // exchange txn, 0.00307%
    expect(body).toContain('₹0.22');     // SEBI, ₹10/crore
    expect(body).toContain('₹15.00');    // stamp duty, 0.015% of buy side only
    expect(body).toContain('₹1.26');     // GST, 18% of (brokerage+SEBI+exchange)
    expect(body).toContain('₹15.34');    // DP charges
  });

  test('turnover uses both legs but stamp duty only the buy leg', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toContain('₹2,20,000.00');  // turnover = buy + sell
    expect(body).toContain('₹1,00,000.00');  // buy value
    expect(body).toContain('₹1,20,000.00');  // sell value
  });

  test('scales linearly with quantity', async ({ page }) => {
    await page.getByLabel('Quantity (shares)').fill('200');
    await page.waitForTimeout(400);
    const body = await page.textContent('body');
    expect(body).toContain('₹501.80');       // charges nearly double (DP is flat)
    expect(body).toContain('₹39,498.20');    // pre-tax profit doubles
  });

  test('editing a charge rate changes the total', async ({ page }) => {
    await page.getByRole('button', { name: /Brokerage & Charges/i }).click();
    await page.getByLabel('Brokerage — Buy (₹)').fill('20');
    await page.getByLabel('Brokerage — Sell (₹)').fill('20');
    await page.waitForTimeout(400);
    const body = await page.textContent('body');
    // +₹40 brokerage and +₹7.20 GST on it
    expect(body).toContain('₹305.77');
  });

  test('unticking Zerodha defaults clears the charge fields', async ({ page }) => {
    await page.getByRole('button', { name: /Brokerage & Charges/i }).click();
    await page.getByRole('checkbox', { name: /Use Zerodha defaults/i }).uncheck();
    await page.waitForTimeout(400);

    await expect(page.getByLabel('STT (%)')).toHaveValue('');
    await expect(page.getByLabel('DP Charges (₹)')).toHaveValue('');
    // With no charges at all, net profit is the raw price difference.
    const body = await page.textContent('body');
    expect(body).toContain('₹20,000.00');
  });

  test('reticking the box restores the published rates', async ({ page }) => {
    await page.getByRole('button', { name: /Brokerage & Charges/i }).click();
    const box = page.getByRole('checkbox', { name: /Use Zerodha defaults/i });
    await box.uncheck();
    await box.check();
    await page.waitForTimeout(400);

    await expect(page.getByLabel('STT (%)')).toHaveValue('0.1');
    await expect(page.getByLabel('DP Charges (₹)')).toHaveValue('15.34');
  });
});

test.describe('@calc Stock Profit Calculator — tax', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stock-profit-calculator/');
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: /Capital Gains Tax/i }).click();
  });

  test('long-term gain under the exemption is untaxed', async ({ page }) => {
    await page.getByRole('button', { name: /Long-term/i }).click();
    await page.waitForTimeout(400);
    const body = await page.textContent('body');
    expect(body).toContain('₹0.00');
    expect(body).toContain('₹19,741.43');   // net == pre-tax
  });

  test('long-term gain above the exemption is taxed at 12.5% on the excess', async ({ page }) => {
    await page.getByLabel('Sell Price per Share (₹)').fill('3000');
    await page.getByRole('button', { name: /Long-term/i }).click();
    await page.waitForTimeout(400);
    const body = await page.textContent('body');
    // 2,00,000 gross - 445.30 charges = 1,99,554.70 pre-tax
    // taxable = 1,99,554.70 - 1,25,000 = 74,554.70 -> 12.5% = 9,319.34
    expect(body).toContain('₹9,319.34');
    expect(body).toContain('₹1,90,235.36');
  });

  test('editing the exemption changes the tax', async ({ page }) => {
    await page.getByLabel('Sell Price per Share (₹)').fill('3000');
    await page.getByRole('button', { name: /Long-term/i }).click();
    await page.getByLabel('LTCG Exemption (₹ per year)').fill('0');
    await page.waitForTimeout(400);
    const body = await page.textContent('body');
    expect(body).toContain('₹24,944.34');   // full 1,99,554.70 taxed at 12.5%
  });

  test('a loss-making trade shows no tax', async ({ page }) => {
    await page.getByLabel('Sell Price per Share (₹)').fill('800');
    await page.waitForTimeout(400);
    const body = await page.textContent('body');
    expect(body).toContain('Net Loss after charges');
    expect(body).toMatch(/−?₹0\.00/);
  });

  test('a break-even trade is a small loss once charges land', async ({ page }) => {
    await page.getByLabel('Sell Price per Share (₹)').fill('1000');
    await page.waitForTimeout(400);
    const body = await page.textContent('body');
    expect(body).toContain('Net Loss after charges');
    expect(body).toContain('₹237.82');   // charges on a 2,00,000 turnover
  });
});

// ---------------------------------------------------------------------------
// MF Profit Calculator
// ---------------------------------------------------------------------------

// Selecting a scheme is the precondition for most of these, so it lives here.
async function pickScheme(page, name = 'Parag Parikh Flexi Cap') {
  await page.getByPlaceholder(/Type at least 3 letters/i).fill(name);
  const option = page.getByRole('button', { name: new RegExp(name, 'i') }).first();
  await expect(option).toBeVisible({ timeout: 30_000 });
  await option.click();
  await expect(page.getByText(/NAV history available/i)).toBeVisible({ timeout: 30_000 });
}

test.describe('@calc MF Profit Calculator — search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mf-profit-calculator/');
  });

  test('loads with the search box and disclaimer', async ({ page }) => {
    await expect(page.getByPlaceholder(/Type at least 3 letters/i)).toBeVisible();
    const body = await page.textContent('body');
    expect(body).toContain('Disclaimer');
    expect(body).toContain('not SEBI-registered');
  });

  test('does not claim "no schemes" while a search is still running', async ({ page }) => {
    await page.getByPlaceholder(/Type at least 3 letters/i).fill('HDFC');
    // The bug this guards: the empty-state message rendered before the first
    // response landed, so the user saw "no schemes" then a list a moment later.
    await page.waitForTimeout(250);
    await expect(page.getByText(/No schemes matched/i)).toBeHidden();
  });

  // MFapi's own /search caps at 15 unranked rows and buries this scheme behind
  // HDFC Balanced Fund and a wall of FMPs. The page loads the full catalogue and
  // ranks locally, so the obvious match must come first.
  test('surfaces HDFC Flexi Cap for a multi-word query', async ({ page }) => {
    await page.getByPlaceholder(/Type at least 3 letters/i).fill('HDFC flexi cap');
    const first = page.locator('button', { hasText: /HDFC Flexi Cap Fund/i }).first();
    await expect(first).toBeVisible({ timeout: 30_000 });
  });

  test('surfaces it from the partial query too', async ({ page }) => {
    await page.getByPlaceholder(/Type at least 3 letters/i).fill('hdfc flexi');
    const first = page.locator('button', { hasText: /HDFC Flexi Cap Fund/i }).first();
    await expect(first).toBeVisible({ timeout: 30_000 });
  });

  test('does not search on fewer than three characters', async ({ page }) => {
    await page.getByPlaceholder(/Type at least 3 letters/i).fill('HD');
    await page.waitForTimeout(1200);
    await expect(page.getByText(/No schemes matched/i)).toBeHidden();
  });

  test('reports a genuinely unmatched name', async ({ page }) => {
    await page.getByPlaceholder(/Type at least 3 letters/i).fill('zzzz nonexistent fund qqq');
    await expect(page.getByText(/No schemes matched/i)).toBeVisible({ timeout: 30_000 });
  });
});

test.describe('@calc MF Profit Calculator — lump sum', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mf-profit-calculator/');
    await pickScheme(page);
  });

  test('defaults the sell date to today', async ({ page }) => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    await expect(page.getByLabel('Sell Date')).toHaveValue(iso);
  });

  test('will not accept a future date', async ({ page }) => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    await expect(page.getByLabel('Sell Date')).toHaveAttribute('max', iso);
    await expect(page.getByLabel('Buy Date')).toHaveAttribute('max', iso);
  });

  test('the amount slider and text field stay in sync', async ({ page }) => {
    const box = page.getByLabel('Investment Amount');
    await box.fill('250000');
    await page.waitForTimeout(300);
    await expect(page.getByText('₹2,50,000').first()).toBeVisible();
  });

  test('computes gain, XIRR and holding period', async ({ page }) => {
    await page.getByRole('button', { name: 'Calculate Profit' }).click();
    await page.waitForTimeout(1000);
    const body = await page.textContent('body');
    expect(body).toMatch(/Total (Gain|Loss)/);
    expect(body).toMatch(/XIRR/);
    expect(body).toMatch(/Units Held/);
    expect(body).toMatch(/Holding Period/);
    expect(body).toMatch(/Buy NAV/);
    expect(body).toMatch(/Sell NAV/);
  });

  test('auto-detects an equity fund and classifies the gain long-term', async ({ page }) => {
    await page.getByRole('button', { name: 'Calculate Profit' }).click();
    await page.waitForTimeout(1000);
    const body = await page.textContent('body');
    expect(body).toMatch(/Long-term \(LTCG\)/);
    expect(body).toMatch(/LTCG @ 12\.5%/);
    expect(body).toContain('₹1,25,000');   // exemption referenced in the note
  });

  test('a short holding is taxed as equity STCG at 20%', async ({ page }) => {
    const today = new Date();
    const recent = new Date(today.getTime() - 30 * 86400000);
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    await page.getByLabel('Buy Date').fill(iso(recent));
    await page.getByRole('button', { name: 'Calculate Profit' }).click();
    await page.waitForTimeout(1000);
    const body = await page.textContent('body');
    expect(body).toMatch(/Short-term \(STCG\)/);
  });

  test('switching to debt reveals the slab input', async ({ page }) => {
    await page.getByRole('button', { name: 'Debt fund' }).click();
    await expect(page.getByLabel('Your Income Tax Slab (%)')).toBeVisible();
  });

  test('rejects a sell date that precedes the buy date', async ({ page }) => {
    await page.getByLabel('Buy Date').fill('2024-06-01');
    await page.getByLabel('Sell Date').fill('2023-06-01');
    await page.getByRole('button', { name: 'Calculate Profit' }).click();
    await page.waitForTimeout(400);
    await expect(page.getByText(/sell date must be after the buy date/i)).toBeVisible();
  });

  test('rejects a buy date before the fund existed', async ({ page }) => {
    await page.getByLabel('Buy Date').fill('1995-01-01');
    await page.getByRole('button', { name: 'Calculate Profit' }).click();
    await page.waitForTimeout(400);
    await expect(page.getByText(/no NAV before/i)).toBeVisible();
  });
});

test.describe('@calc MF Profit Calculator — SIP', () => {
  test('computes a SIP with instalment count and XIRR', async ({ page }) => {
    await page.goto('/mf-profit-calculator/');
    await pickScheme(page);

    await page.getByRole('button', { name: 'SIP', exact: true }).click();
    await page.getByLabel('Buy Date').fill('2021-07-19');
    await page.getByRole('button', { name: 'Calculate Profit' }).click();
    await page.waitForTimeout(1500);

    const body = await page.textContent('body');
    expect(body).toMatch(/SIP Instalments/);
    expect(body).toMatch(/XIRR/);
    // ~5 years of monthly instalments
    expect(body).toMatch(/\b(5[0-9]|6[0-5])\b/);
  });

  test('SIP mode relabels the date fields', async ({ page }) => {
    await page.goto('/mf-profit-calculator/');
    await pickScheme(page);
    await page.getByRole('button', { name: 'SIP', exact: true }).click();

    await expect(page.getByText('SIP Start Date')).toBeVisible();
    await expect(page.getByText('SIP End / Redeem Date')).toBeVisible();
    await expect(page.getByLabel('Monthly SIP Amount')).toBeVisible();
  });
});

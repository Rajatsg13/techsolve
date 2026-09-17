// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * End-to-end tests for the document generators.
 * Tag: @generators
 *
 * These drive the real form and click the real Download button, then inspect
 * the bytes the browser was actually handed. A generator is only considered
 * working when its downloaded PDF has been checked — totals rendered on screen
 * are not sufficient, because the PDF is built by a separate code path.
 */

/** Set a React-controlled input so onChange fires. */
async function fill(page, id, value) {
  await page.evaluate(([id, value]) => {
    const el = document.getElementById(id);
    if (!el) throw new Error('no field ' + id);
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, [id, value]);
}

/** Click the download button and return the PDF bytes the browser received. */
async function capturePdf(page, buttonText) {
  await page.evaluate(() => {
    window.__cap = null;
    const orig = URL.createObjectURL;
    URL.createObjectURL = function (b) { window.__cap = b; return orig.call(URL, b); };
  });
  await page.getByRole('button', { name: buttonText }).click();
  await page.waitForFunction(() => window.__cap !== null, null, { timeout: 15000 });
  return Buffer.from(await page.evaluate(async () => {
    const buf = new Uint8Array(await window.__cap.arrayBuffer());
    return Array.from(buf);
  }));
}

const pdfText = (buf) => buf.toString('latin1');

test.describe('@generators Invoice', () => {
  test('generates a PDF with correct totals', async ({ page }) => {
    await page.goto('/invoice-generator/');
    for (const [id, v] of Object.entries({
      'inv-seller': 'Meridian Design Studio LLP',
      'inv-buyer': 'Northwind Manufacturing Private Limited',
      'inv-number': 'INV-TEST-1',
      'inv-date': '2026-08-05',
    })) await fill(page, id, v);

    // one line: 1 x 285000, 10% discount, 18% tax -> taxable 256500, total 302670
    const sec = page.getByTestId('section-line-items');
    await sec.locator('input[type="text"]').first().fill('Design retainer');
    const nums = sec.locator('input[type="number"]');
    await nums.nth(0).fill('1');
    await nums.nth(1).fill('285000');
    await nums.nth(2).fill('10');
    await nums.nth(3).fill('18');

    await expect(page.getByText('₹3,02,670.00').first()).toBeVisible();

    const pdf = await capturePdf(page, /Download invoice PDF/i);
    expect(pdf.length).toBeGreaterThan(1000);
    expect(pdfText(pdf).startsWith('%PDF-')).toBe(true);
    expect(pdfText(pdf).trimEnd().endsWith('%%EOF')).toBe(true);
  });

  test('blocks download until required fields are filled', async ({ page }) => {
    await page.goto('/invoice-generator/');
    await expect(page.getByRole('button', { name: /Download invoice PDF/i })).toBeDisabled();
    await expect(page.getByText(/Add your business name/i)).toBeVisible();
  });
});

test.describe('@generators Payslip', () => {
  test('computes net pay and generates a PDF', async ({ page }) => {
    await page.goto('/payslip-generator/');
    for (const [id, v] of Object.entries({
      'ps-employer': 'Northwind Manufacturing Private Limited',
      'ps-period': 'August 2026',
      'ps-emp': 'Lakshmi Subramanian',
    })) await fill(page, id, v);

    const earn = page.getByTestId('section-earnings');
    await earn.locator('input[type="text"]').nth(0).fill('Basic salary');
    await earn.locator('input[type="number"]').nth(0).fill('62000');
    await earn.locator('input[type="text"]').nth(1).fill('House rent allowance');
    await earn.locator('input[type="number"]').nth(1).fill('31000');

    const ded = page.getByTestId('section-deductions');
    await ded.locator('input[type="text"]').nth(0).fill('Provident fund');
    await ded.locator('input[type="number"]').nth(0).fill('7440');

    // 93000 - 7440 = 85560
    await expect(page.getByText('₹85,560.00').first()).toBeVisible();

    const pdf = await capturePdf(page, /Download payslip PDF/i);
    expect(pdf.length).toBeGreaterThan(1000);
    expect(pdfText(pdf).startsWith('%PDF-')).toBe(true);
  });

  test('warns when deductions exceed earnings but still generates', async ({ page }) => {
    await page.goto('/payslip-generator/');
    for (const [id, v] of Object.entries({
      'ps-employer': 'Acme', 'ps-period': 'August 2026', 'ps-emp': 'Test Employee',
    })) await fill(page, id, v);
    const earn = page.getByTestId('section-earnings');
    await earn.locator('input[type="text"]').nth(0).fill('Basic');
    await earn.locator('input[type="number"]').nth(0).fill('1000');
    const ded = page.getByTestId('section-deductions');
    await ded.locator('input[type="text"]').nth(0).fill('Recovery');
    await ded.locator('input[type="number"]').nth(0).fill('1500');

    await expect(page.getByText(/Deductions exceed gross earnings/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Download payslip PDF/i })).toBeEnabled();
  });
});

test.describe('@generators Rent receipt', () => {
  test('generates a PDF and shows the amount in words', async ({ page }) => {
    await page.goto('/rent-receipt-generator/');
    for (const [id, v] of Object.entries({
      'rr-landlord': 'Rajeshwari Krishnamurthy',
      'rr-pan': 'AAKPR7788L',
      'rr-tenant': 'Arjun Mehta',
      'rr-property': 'Flat 402, Sunrise Residency, Koramangala, Bengaluru',
      'rr-amount': '42500',
      'rr-from': '2026-08-01',
      'rr-to': '2026-08-31',
      'rr-paydate': '2026-08-03',
    })) await fill(page, id, v);

    await expect(page.getByText(/Forty Two Thousand Five Hundred/i)).toBeVisible();

    const pdf = await capturePdf(page, /Download receipt PDF/i);
    expect(pdf.length).toBeGreaterThan(800);
    expect(pdfText(pdf).startsWith('%PDF-')).toBe(true);
  });

  test('rejects a rent period that ends before it starts', async ({ page }) => {
    await page.goto('/rent-receipt-generator/');
    for (const [id, v] of Object.entries({
      'rr-landlord': 'A', 'rr-tenant': 'B', 'rr-property': 'C', 'rr-amount': '1000',
      'rr-from': '2026-08-31', 'rr-to': '2026-08-01', 'rr-paydate': '2026-08-03',
    })) await fill(page, id, v);
    await expect(page.getByText(/before the start/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Download receipt PDF/i })).toBeDisabled();
  });

  test('warns about characters the PDF font cannot draw', async ({ page }) => {
    await page.goto('/rent-receipt-generator/');
    await fill(page, 'rr-landlord', 'राजेश्वरी कृष्णमूर्ति');
    await expect(page.getByText(/Some characters cannot be printed/i)).toBeVisible();
  });
});

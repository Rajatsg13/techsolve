// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Contact form tests.
 * Tag: @contact
 *
 * This page shipped for months with a handler that faked success and sent
 * nothing — it rendered "Message Sent!" while discarding every message. These
 * tests exist primarily to make that regression impossible to reintroduce:
 * the success state must never appear unless a request actually succeeded.
 *
 * All submissions are intercepted with page.route(); runs never deliver mail.
 */

const ENDPOINT = 'https://api.web3forms.com/submit';

async function mockSubmit(page, { ok = true, body = { success: true } } = {}) {
  const captured = [];
  await page.route(ENDPOINT, async (route) => {
    captured.push(JSON.parse(route.request().postData() || '{}'));
    await route.fulfill({
      status: ok ? 200 : 500,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  return captured;
}

async function fill(page, { name = 'Test Person', email = 'test@example.com', message = 'A test message' } = {}) {
  await page.locator('#contact-name').fill(name);
  await page.locator('#contact-email').fill(email);
  await page.locator('#contact-message').fill(message);
}

test.describe('@contact Contact form', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/contact/'); });

  test('renders all three required fields', async ({ page }) => {
    await expect(page.locator('#contact-name')).toBeVisible();
    await expect(page.locator('#contact-email')).toBeVisible();
    await expect(page.locator('#contact-message')).toBeVisible();
    for (const id of ['#contact-name', '#contact-email', '#contact-message']) {
      await expect(page.locator(id)).toHaveAttribute('required', '');
    }
  });

  test('actually posts to Web3Forms', async ({ page }) => {
    const captured = await mockSubmit(page);
    await fill(page);
    await page.getByRole('button', { name: /Send Message/i }).click();

    await expect(page.getByText(/Message Sent/i)).toBeVisible({ timeout: 10_000 });
    expect(captured).toHaveLength(1);
    expect(captured[0].access_key).toBeTruthy();
    expect(captured[0].subject).toBe('TechSolve44 Contact Form');
    expect(captured[0].name).toBe('Test Person');
    expect(captured[0].email).toBe('test@example.com');
    expect(captured[0].message).toBe('A test message');
  });

  test('does not navigate away on submit', async ({ page }) => {
    await mockSubmit(page);
    const before = page.url();
    await fill(page);
    await page.getByRole('button', { name: /Send Message/i }).click();
    await expect(page.getByText(/Message Sent/i)).toBeVisible({ timeout: 10_000 });
    expect(page.url()).toBe(before);
  });

  test('carries an off-screen honeypot', async ({ page }) => {
    const hp = page.locator('input[name="botcheck"]').first();
    await expect(hp).toHaveAttribute('type', 'text');
    await expect(hp).toHaveAttribute('tabindex', '-1');
  });

  // The regression guards. Each asserts the success state does NOT appear.
  test('a server error does not claim the message was sent', async ({ page }) => {
    await mockSubmit(page, { ok: false, body: { success: false, message: 'nope' } });
    await fill(page);
    await page.getByRole('button', { name: /Send Message/i }).click();

    await expect(page.getByText(/Something went wrong sending that/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Message Sent/i)).toBeHidden();
    await expect(page.getByText(/has not been sent/i)).toBeVisible();
  });

  test('a 200 carrying success:false does not claim delivery', async ({ page }) => {
    await mockSubmit(page, { ok: true, body: { success: false, message: 'rejected' } });
    await fill(page);
    await page.getByRole('button', { name: /Send Message/i }).click();

    await expect(page.getByText(/Something went wrong sending that/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Message Sent/i)).toBeHidden();
  });

  test('a network failure does not claim delivery', async ({ page }) => {
    await page.route(ENDPOINT, route => route.abort('failed'));
    await fill(page);
    await page.getByRole('button', { name: /Send Message/i }).click();

    await expect(page.getByText(/Could not reach the server/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Message Sent/i)).toBeHidden();
  });

  test('the typed message survives a failure so it can be retried', async ({ page }) => {
    await mockSubmit(page, { ok: false });
    await fill(page, { message: 'please keep this text' });
    await page.getByRole('button', { name: /Send Message/i }).click();
    await expect(page.getByText(/has not been sent/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('#contact-message')).toHaveValue('please keep this text');
  });

  test('the button reports progress and cannot be double-submitted', async ({ page }) => {
    let hits = 0;
    await page.route(ENDPOINT, async (route) => {
      hits++;
      await new Promise(r => setTimeout(r, 1200));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    });
    await fill(page);
    const btn = page.getByRole('button', { name: /Send Message|Sending/i });
    await btn.click();
    await expect(btn).toHaveText(/Sending/i);
    await expect(btn).toBeDisabled();
    await expect(page.getByText(/Message Sent/i)).toBeVisible({ timeout: 15_000 });
    expect(hits).toBe(1);
  });
});

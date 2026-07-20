// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Sitewide feedback widget tests.
 * Tag: @feedback
 *
 * Every submit path is intercepted with page.route() — these tests must never
 * deliver real mail to the Web3Forms inbox. The only assertion made about the
 * live endpoint is the shape of the request the page sends to it.
 */

const ENDPOINT = 'https://api.web3forms.com/submit';

// Mount point is app/layout.js, so a handful of structurally different routes
// is enough to prove "every page" without walking all 25.
const SAMPLE_ROUTES = [
  '/',
  '/emi-calculator/',
  '/mf-profit-calculator/',
  '/pdf-merge/',
  '/about/',
  '/privacy-policy/',
];

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

test.describe('@feedback Presence', () => {
  for (const path of SAMPLE_ROUTES) {
    test(`renders on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText(/Didn.t find the calculator you need/i)).toBeVisible();
      // Exactly one instance — mounting inside a page as well as the layout
      // would double it.
      await expect(page.locator('[aria-controls="feedback-widget-form"]')).toHaveCount(1);
    });
  }
});

test.describe('@feedback Collapsed state', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('starts collapsed with no form fields', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Share it/i })).toBeVisible();
    await expect(page.locator('#feedback-message')).toBeHidden();
    await expect(page.locator('#feedback-widget-form')).toHaveCount(0);
  });

  test('is inline, not a floating or sticky overlay', async ({ page }) => {
    const pos = await page.locator('#feedback-widget-form').or(
      page.getByText(/Didn.t find the calculator you need/i)
    ).first().evaluate((el) => {
      // Walk up looking for any fixed/sticky ancestor.
      let n = el, found = null;
      while (n && n !== document.body) {
        const p = getComputedStyle(n).position;
        if (p === 'fixed' || p === 'sticky') { found = p; break; }
        n = n.parentElement;
      }
      return found;
    });
    expect(pos).toBeNull();
  });

  test('toggle exposes its expanded state to assistive tech', async ({ page }) => {
    // Address it by aria-controls, not by name — the label flips to "Close".
    const toggle = page.locator('[aria-controls="feedback-widget-form"]');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveText(/Close/i);
  });
});

test.describe('@feedback Expanded form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Share it/i }).click();
  });

  test('shows the message field, optional email and consent line', async ({ page }) => {
    await expect(page.locator('#feedback-message')).toBeVisible();
    await expect(page.locator('#feedback-email')).toBeVisible();
    await expect(page.getByText(/anonymized version of your feedback/i)).toBeVisible();
  });

  test('the message field is required, email is not', async ({ page }) => {
    await expect(page.locator('#feedback-message')).toHaveAttribute('required', '');
    await expect(page.locator('#feedback-email')).not.toHaveAttribute('required', '');
  });

  test('submit stays disabled until a message is typed', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Send feedback/i });
    await expect(btn).toBeDisabled();
    await page.locator('#feedback-message').fill('a calculator for something');
    await expect(btn).toBeEnabled();
  });

  test('whitespace alone does not enable submit', async ({ page }) => {
    await page.locator('#feedback-message').fill('     ');
    await expect(page.getByRole('button', { name: /Send feedback/i })).toBeDisabled();
  });

  test('carries an off-screen honeypot that is not type=hidden', async ({ page }) => {
    const hp = page.locator('input[name="botcheck"]');
    await expect(hp).toHaveCount(1);
    await expect(hp).toHaveAttribute('type', 'text');
    await expect(hp).toHaveAttribute('tabindex', '-1');
    // Present in the DOM but off-screen, so bots that skip type=hidden still fill it.
    const offscreen = await hp.evaluate(el => el.getBoundingClientRect().left < -1000);
    expect(offscreen).toBe(true);
  });

  test('the toggle collapses it again', async ({ page }) => {
    await page.getByRole('button', { name: /Close/i }).click();
    await expect(page.locator('#feedback-widget-form')).toHaveCount(0);
  });
});

test.describe('@feedback Submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Share it/i }).click();
  });

  test('posts the expected payload without navigating away', async ({ page }) => {
    const captured = await mockSubmit(page);
    const urlBefore = page.url();

    await page.locator('#feedback-message').fill('An Axis Atlas vs Infinia comparison');
    await page.locator('#feedback-email').fill('someone@example.com');
    await page.getByRole('button', { name: /Send feedback/i }).click();

    await expect(page.getByText(/we read every submission/i)).toBeVisible({ timeout: 10_000 });

    expect(page.url()).toBe(urlBefore);          // static export: must not navigate
    expect(captured).toHaveLength(1);
    expect(captured[0].access_key).toBeTruthy();
    expect(captured[0].subject).toBe('TechSolve44 Feedback Widget');
    expect(captured[0].message).toBe('An Axis Atlas vs Infinia comparison');
    expect(captured[0].email).toBe('someone@example.com');
    expect(captured[0].botcheck).toBe('');
  });

  test('email is omitted when left blank', async ({ page }) => {
    const captured = await mockSubmit(page);
    await page.locator('#feedback-message').fill('no email given');
    await page.getByRole('button', { name: /Send feedback/i }).click();
    await expect(page.getByText(/we read every submission/i)).toBeVisible({ timeout: 10_000 });
    expect(captured[0].email).toBeUndefined();
  });

  test('records the page the feedback came from', async ({ page }) => {
    await page.goto('/emi-calculator/');
    await page.getByRole('button', { name: /Share it/i }).click();
    const captured = await mockSubmit(page);
    await page.locator('#feedback-message').fill('from the EMI page');
    await page.getByRole('button', { name: /Send feedback/i }).click();
    await expect(page.getByText(/we read every submission/i)).toBeVisible({ timeout: 10_000 });
    expect(captured[0].page).toBe('/emi-calculator/');
  });

  test('collapses itself a few seconds after success', async ({ page }) => {
    await mockSubmit(page);
    await page.locator('#feedback-message').fill('should auto-collapse');
    await page.getByRole('button', { name: /Send feedback/i }).click();
    await expect(page.getByText(/we read every submission/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('#feedback-widget-form')).toHaveCount(0, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Share it/i })).toBeVisible();
  });

  // Asserts against dataLayer rather than a stubbed window.gtag: layout.js
  // declares `function gtag(){...}` in classic script scope, which hoists onto
  // window and replaces any stub installed via addInitScript.
  test('fires the analytics event on success', async ({ page }) => {
    await mockSubmit(page);
    await page.locator('#feedback-message').fill('analytics check');
    await page.getByRole('button', { name: /Send feedback/i }).click();
    await expect(page.getByText(/we read every submission/i)).toBeVisible({ timeout: 10_000 });

    const pushed = await page.evaluate(() =>
      (window.dataLayer || []).map(a => Array.from(a))
    );
    expect(pushed).toContainEqual(['event', 'feedback_widget_submit']);
  });
});

test.describe('@feedback Failure handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Share it/i }).click();
  });

  test('a server error is reported inline and the text is kept', async ({ page }) => {
    await mockSubmit(page, { ok: false, body: { success: false, message: 'nope' } });
    await page.locator('#feedback-message').fill('this should fail');
    await page.getByRole('button', { name: /Send feedback/i }).click();

    await expect(page.getByText(/Something went wrong sending that/i)).toBeVisible({ timeout: 10_000 });
    // The user's words must survive a failure so they can retry.
    await expect(page.locator('#feedback-message')).toHaveValue('this should fail');
    await expect(page.getByText(/we read every submission/i)).toBeHidden();
  });

  test('a network failure reports a connection problem', async ({ page }) => {
    await page.route(ENDPOINT, route => route.abort('failed'));
    await page.locator('#feedback-message').fill('network down');
    await page.getByRole('button', { name: /Send feedback/i }).click();
    await expect(page.getByText(/Could not reach the server/i)).toBeVisible({ timeout: 10_000 });
  });

  test('a 200 carrying success:false is treated as a failure', async ({ page }) => {
    await mockSubmit(page, { ok: true, body: { success: false, message: 'rejected' } });
    await page.locator('#feedback-message').fill('soft failure');
    await page.getByRole('button', { name: /Send feedback/i }).click();
    await expect(page.getByText(/Something went wrong sending that/i)).toBeVisible({ timeout: 10_000 });
  });
});

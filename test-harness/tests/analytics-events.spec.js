// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * End-to-end tests for GA4 event emission.
 * Tag: @analytics
 *
 * gtag is replaced with a recorder before any page script runs, so these assert
 * on the events the site actually emits — including the ones that must NOT be
 * emitted, which is the harder half.
 */

const FIX = path.resolve(__dirname, '..', 'fixtures');
const fx = (n) => path.join(FIX, n);

/**
 * Read events out of dataLayer.
 *
 * Overriding window.gtag does not work: layout.js declares `function gtag(){}`
 * at global scope, which replaces any earlier assignment. Every call lands in
 * dataLayer as ['event', name, params], which is what gtag.js itself consumes,
 * so reading that is both reliable and closer to the real mechanism.
 */
async function record(page) {
  await page.addInitScript(() => {
    // Mirror every push into sessionStorage as well as the array. A
    // related-tool click navigates, which would otherwise discard the very
    // event under test; sessionStorage survives same-tab navigation.
    const KEY = '__ga_events';
    const store = [];
    store.push = function (...args) {
      for (const a of args) {
        const arr = Array.from(a);
        if (arr[0] === 'event') {
          const prev = JSON.parse(sessionStorage.getItem(KEY) || '[]');
          prev.push({ name: arr[1], params: arr[2] || {} });
          sessionStorage.setItem(KEY, JSON.stringify(prev));
        }
      }
      return Array.prototype.push.apply(this, args);
    };
    window.dataLayer = store;
  });
}
const events = (page) => page.evaluate(() => {
  try { return JSON.parse(sessionStorage.getItem('__ga_events') || '[]'); }
  catch { return []; }
});
const named = async (page, name) => (await events(page)).filter(e => e.name === name);

/* ── Calculators: the pre-filled trap ──────────────────────────────────── */

const PREFILLED = [
  'percentage-calculator', 'percentage-increase-calculator', 'gst-calculator',
  'profit-margin-calculator', 'break-even-calculator', 'roi-calculator',
  'salary-hike-calculator',
];

test.describe('@analytics calculators', () => {
  for (const slug of PREFILLED) {
    test(`${slug} emits nothing on page load despite showing a result`, async ({ page }) => {
      await record(page);
      await page.goto(`/${slug}/`);
      await page.waitForTimeout(600);
      // A finished result is on screen, but the user has done nothing.
      expect(await events(page)).toEqual([]);
    });
  }

  test('working-days emits nothing on load either', async ({ page }) => {
    await record(page);
    await page.goto('/working-days-calculator/');
    await page.waitForTimeout(600);
    expect(await events(page)).toEqual([]);
  });

  test('first edit emits tool_started, then tool_completed, once each', async ({ page }) => {
    await record(page);
    await page.goto('/gst-calculator/');
    await page.getByLabel('Amount').fill('5000');
    await page.waitForTimeout(400);

    expect(await named(page, 'tool_started')).toHaveLength(1);
    expect(await named(page, 'tool_completed')).toHaveLength(1);
    expect((await named(page, 'tool_started'))[0].params)
      .toEqual({ tool_slug: 'gst-calculator', tool_category: 'business' });
  });

  test('further edits do not emit a second completion', async ({ page }) => {
    await record(page);
    await page.goto('/gst-calculator/');
    await page.getByLabel('Amount').fill('5000');
    await page.waitForTimeout(300);
    await page.getByLabel('Amount').fill('7500');
    await page.getByLabel('Amount').fill('9000');
    await page.waitForTimeout(400);

    expect(await named(page, 'tool_started')).toHaveLength(1);
    expect(await named(page, 'tool_completed')).toHaveLength(1);
  });

  test('working-days completes only once the inputs make a valid result', async ({ page }) => {
    await record(page);
    await page.goto('/working-days-calculator/');
    await page.getByLabel('Start date', { exact: true }).first().fill('2026-09-01');
    await page.waitForTimeout(300);
    // Started, but one date alone cannot produce a result.
    expect(await named(page, 'tool_started')).toHaveLength(1);
    expect(await named(page, 'tool_completed')).toHaveLength(0);

    await page.getByLabel('End date', { exact: true }).first().fill('2026-09-30');
    await page.waitForTimeout(400);
    expect(await named(page, 'tool_completed')).toHaveLength(1);
  });
});

/* ── Data & Text ───────────────────────────────────────────────────────── */

test.describe('@analytics data and text tools', () => {
  test('typing alone emits nothing; the action emits started and completed', async ({ page }) => {
    await record(page);
    await page.goto('/json-formatter/');
    await page.locator('textarea').first().fill('{"a":1}');
    await page.waitForTimeout(300);
    expect(await events(page)).toEqual([]);

    await page.getByRole('button', { name: 'Format', exact: true }).click();
    await page.waitForTimeout(300);
    expect(await named(page, 'tool_started')).toHaveLength(1);
    expect(await named(page, 'tool_completed')).toHaveLength(1);
  });

  test('invalid JSON is not reported as a tool error', async ({ page }) => {
    await record(page);
    await page.goto('/json-formatter/');
    await page.locator('textarea').first().fill('{"a":');
    await page.getByRole('button', { name: 'Format', exact: true }).click();
    await page.waitForTimeout(300);
    // The user's text was invalid — the tool worked correctly and said so.
    expect(await named(page, 'tool_error')).toHaveLength(0);
    expect(await named(page, 'tool_completed')).toHaveLength(0);
    expect(await named(page, 'tool_started')).toHaveLength(1);
  });
});

/* ── File tools ────────────────────────────────────────────────────────── */

test.describe('@analytics file tools', () => {
  test('rotate: started, completed and downloaded, in order', async ({ page }) => {
    test.setTimeout(120000);
    await record(page);
    await page.goto('/pdf-rotate/');
    await page.locator('input[type="file"]').setInputFiles(fx('mixed-orientation.pdf'));
    await expect(page.getByTestId('page-grid')).toBeVisible({ timeout: 60000 });
    // Uploading is not starting.
    expect(await named(page, 'tool_started')).toHaveLength(0);

    await page.getByTestId('right-0').click();
    await page.getByTestId('save').click();
    await page.waitForTimeout(1500);

    const names = (await events(page)).map(e => e.name);
    expect(names).toEqual(['tool_started', 'tool_completed', 'tool_downloaded']);
    expect((await named(page, 'tool_downloaded'))[0].params).toEqual({ tool_slug: 'pdf-rotate' });
  });

  test('a real processing failure emits tool_error with a generic reason', async ({ page }) => {
    await record(page);
    await page.goto('/image-compress/');
    await page.locator('input[type="file"]').setInputFiles(fx('not-an-image.jpg'));
    await page.waitForTimeout(800);

    const errs = await named(page, 'tool_error');
    expect(errs).toHaveLength(1);
    expect(errs[0].params.error_reason).toBe('load_failed');
    // No filename anywhere in the payload.
    expect(JSON.stringify(errs[0].params)).not.toContain('not-an-image');
  });

  test('pdf-to-jpg emits downloaded, because it does download files', async ({ page }) => {
    test.setTimeout(120000);
    await record(page);
    await page.goto('/pdf-to-jpg/');
    await page.locator('input[type="file"]').setInputFiles(fx('mixed-orientation.pdf'));
    await page.getByRole('button', { name: /Convert to JPG/i }).click();
    await expect(page.getByRole('button', { name: /Download All/i })).toBeVisible({ timeout: 90000 });

    expect(await named(page, 'tool_completed')).toHaveLength(1);
    expect(await named(page, 'tool_downloaded')).toHaveLength(0);   // not until a download is clicked

    await page.getByRole('button', { name: 'Download', exact: true }).first().click();
    await page.waitForTimeout(400);
    expect(await named(page, 'tool_downloaded')).toHaveLength(1);
  });

  test('Download All counts the run once, not once per page', async ({ page }) => {
    test.setTimeout(120000);
    await record(page);
    await page.goto('/pdf-to-jpg/');
    await page.locator('input[type="file"]').setInputFiles(fx('mixed-orientation.pdf'));
    await page.getByRole('button', { name: /Convert to JPG/i }).click();
    const all = page.getByRole('button', { name: /Download All/i });
    await expect(all).toBeVisible({ timeout: 90000 });

    await all.click();
    // The fixture has 4 pages, so an untracked loop would report 4.
    await page.waitForTimeout(2500);
    expect(await named(page, 'tool_downloaded')).toHaveLength(1);
  });

  test('generators emit the full flow', async ({ page }) => {
    await record(page);
    await page.goto('/rent-receipt-generator/');
    for (const [id, v] of Object.entries({
      'rr-landlord': 'R Sharma', 'rr-tenant': 'A Khan',
      'rr-property': '12 Main St', 'rr-amount': '25000',
      'rr-from': '2026-08-01', 'rr-to': '2026-08-31', 'rr-paydate': '2026-08-03',
    })) {
      await page.evaluate(([id, v]) => {
        const el = document.getElementById(id);
        const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }, [id, v]);
    }
    await page.getByRole('button', { name: /Download receipt PDF/i }).click();
    await page.waitForTimeout(1500);
    const names = (await events(page)).map(e => e.name);
    expect(names).toEqual(['tool_started', 'tool_completed', 'tool_downloaded']);
  });
});

/* ── Shared components ─────────────────────────────────────────────────── */

test.describe('@analytics shared components', () => {
  test('related tool click carries origin and destination', async ({ page }) => {
    await record(page);
    await page.goto('/pdf-rotate/');
    // Wait for hydration: before React attaches, the card is a plain anchor and
    // a click navigates without running the handler.
    await expect(page.locator('input[type="file"]')).toBeAttached();
    await page.waitForLoadState('networkidle');
    // Scope to the Related tools section: the header navigation also links to
    // /pdf-organize/, and that link is not instrumented.
    const section = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Related tools' }) });
    const link = section.locator('a[href*="pdf-organize"]').first();
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await page.waitForTimeout(500);

    const ev = (await named(page, 'related_tool_clicked'))[0];
    expect(ev.params.from_tool_slug).toBe('pdf-rotate');
    expect(ev.params.to_tool_slug).toBe('pdf-organize');
  });

  test('share click records the platform and the tool', async ({ page }) => {
    await record(page);
    await page.goto('/pdf-merge/');
    await page.getByRole('button', { name: /^Share$/ }).first().click();
    await page.getByRole('link', { name: 'WhatsApp' }).click();
    await page.waitForTimeout(300);

    const ev = (await named(page, 'share_clicked'))[0];
    expect(ev.params).toEqual({ platform: 'whatsapp', tool_slug: 'pdf-merge' });
  });

  test('share from the homepage carries no tool slug', async ({ page }) => {
    await record(page);
    await page.goto('/');
    await page.getByRole('button', { name: /^Share$/ }).first().click();
    await page.getByRole('link', { name: 'LinkedIn' }).click();
    await page.waitForTimeout(300);

    expect((await named(page, 'share_clicked'))[0].params).toEqual({ platform: 'linkedin' });
  });
});

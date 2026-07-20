// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Page load tests — verify every tool page loads without errors.
 * Tag: @pages
 */

const TOOL_PAGES = [
  // PDF Tools
  { path: '/pdf-merge/', title: 'Merge' },
  { path: '/pdf-split/', title: 'Split' },
  { path: '/pdf-compress/', title: 'Compress' },
  { path: '/pdf-organize/', title: 'Organize' },
  { path: '/pdf-to-word/', title: 'Word' },
  { path: '/pdf-to-jpg/', title: 'JPG' },
  { path: '/word-to-pdf/', title: 'Word to PDF' },
  { path: '/html-to-pdf/', title: 'HTML to PDF' },
  { path: '/pdf-ocr/', title: 'OCR' },
  { path: '/pdf-watermark/', title: 'Watermark' },
  { path: '/pdf-page-numbers/', title: 'Page Numbers' },
  { path: '/pdf-unlock/', title: 'Unlock' },
  { path: '/scan-to-pdf/', title: 'Scan' },
  { path: '/image-to-pdf/', title: 'Image to PDF' },
  { path: '/image-resize/', title: 'Image Resize' },
  // Calculators
  { path: '/emi-calculator/', title: 'EMI' },
  { path: '/sip-calculator/', title: 'SIP' },
  { path: '/lumpsum-calculator/', title: 'Lumpsum' },
  { path: '/ppf-calculator/', title: 'PPF' },
  { path: '/income-tax-calculator/', title: 'Income Tax' },
  { path: '/fire-calculator/', title: 'FIRE' },
  { path: '/graham-number-calculator/', title: 'Graham' },
  { path: '/sharpe-ratio-calculator/', title: 'Sharpe' },
  { path: '/stock-profit-calculator/', title: 'Stock Profit' },
  { path: '/mf-profit-calculator/', title: 'MF Profit' },
  // Info pages
  { path: '/about/', title: 'About' },
  { path: '/contact/', title: 'Contact' },
  { path: '/terms-of-service/', title: 'Terms' },
  { path: '/privacy-policy/', title: 'Privacy' },
];

test.describe('@pages All pages load', () => {
  for (const page of TOOL_PAGES) {
    test(`${page.path} loads (${page.title})`, async ({ page: p }) => {
      const consoleErrors = [];
      p.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      const response = await p.goto(page.path);
      expect(response.status()).toBe(200);

      // Page has a title
      const title = await p.title();
      expect(title.length).toBeGreaterThan(5);

      // No critical JS errors (filter out known benign ones)
      const realErrors = consoleErrors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('ERR_BLOCKED_BY_CLIENT') &&  // ad blocker
        !e.includes('googletagmanager')
      );
      expect(realErrors).toHaveLength(0);
    });
  }
});

test.describe('@pages Footer and nav', () => {
  test('Homepage loads', async ({ page }) => {
    await page.goto('/');
    expect(await page.title()).toContain('TechSolve');
  });

  test('404 page works', async ({ page }) => {
    const resp = await page.goto('/nonexistent-page-xyz/');
    // Hostinger may return 200 with custom 404 or actual 404
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
});

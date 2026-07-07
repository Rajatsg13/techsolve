const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120_000,       // 2 min per test (OCR is slow)
  retries: 1,
  workers: 1,             // sequential — avoids download conflicts
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'https://techsolve44.com',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120_000,       // 2 min per test (OCR is slow)
  retries: 1,
  workers: 1,             // sequential — avoids download conflicts
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    // Defaults to production. Point at a local static build to check a change
    // before it ships:
    //   (cd .. && npm run build && npx serve out -p 5055)
    //   BASE_URL=http://localhost:5055 npm test
    baseURL: process.env.BASE_URL || 'https://techsolve44.com',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});

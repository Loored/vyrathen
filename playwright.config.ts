import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'output/playwright/test-results',
  fullyParallel: false,
  reporter: [['html', { outputFolder: 'output/playwright/report', open: 'never' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'on',
    viewport: { width: 1366, height: 768 }, colorScheme: 'dark', reducedMotion: 'reduce',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: false, timeout: 30_000 },
});

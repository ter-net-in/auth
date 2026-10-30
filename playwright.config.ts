import { defineConfig } from 'playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.pw.ts',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3515', trace: 'retain-on-failure' },
  webServer: {
    command: 'node apps/web/node_modules/next/dist/bin/next start apps/web -p 3515',
    url: 'http://127.0.0.1:3515/login',
    reuseExistingServer: false,
    env: { BETTER_AUTH_URL: 'http://127.0.0.1:3515' }
  }
})

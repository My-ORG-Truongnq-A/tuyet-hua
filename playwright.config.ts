import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3210);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * e2e chạy trên BẢN BUILD PRODUCTION LOCAL với seed (Q-118, QA-01):
 * `pnpm build && pnpm start`, SANITY_SOURCE=seed, không gọi Sanity.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT} -H 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      SANITY_SOURCE: "seed",
      NEXT_PUBLIC_SITE_URL: baseURL,
      ALLOW_INDEXING: "0",
      LEADS_DRY_RUN: "1",
    },
  },
});

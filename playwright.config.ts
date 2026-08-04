import { defineConfig, devices } from "@playwright/test";

/** Where the signed-in demo session is cached between runs. */
export const STORAGE_STATE = "e2e/.auth/user.json";

export default defineConfig({
  testDir: "./e2e",
  // Vitest owns src/**/*.test.ts; Playwright only ever looks at e2e/*.spec.ts.
  testMatch: /.*\.(setup|spec)\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      // Specs only — without this the setup project's file runs here too,
      // doubling sign-in attempts against the login rate limit.
      testMatch: /.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/sign-in",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

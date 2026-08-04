import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test as setup } from "@playwright/test";

import { STORAGE_STATE } from "./constants";

const DEMO_EMAIL = "demo@devstash.io";
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? "12345678";

/**
 * Signs in once and caches the session to disk.
 *
 * Credentials login is rate limited to 5 attempts / 15 min per IP+email, so a
 * fresh sign-in on every run would lock the suite out after the fifth
 * invocation. An existing storage state is reused whenever it still resolves a
 * protected route, and only re-created when it has expired.
 */
setup("authenticate as the demo user", async ({ browser }) => {
  if (existsSync(STORAGE_STATE)) {
    const context = await browser.newContext({ storageState: STORAGE_STATE });
    const page = await context.newPage();
    await page.goto("/dashboard");
    const stillSignedIn = new URL(page.url()).pathname === "/dashboard";
    await context.close();
    if (stillSignedIn) {
      setup.info().annotations.push({
        type: "info",
        description: "Reused cached session (avoids the login rate limit).",
      });
      return;
    }
  }

  await mkdir(path.dirname(STORAGE_STATE), { recursive: true });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(DEMO_EMAIL);
  await page.getByLabel(/password/i).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /^sign in$/i }).click();

  await page.waitForURL("**/dashboard");
  await expect(page.getByText(DEMO_EMAIL)).toBeVisible();

  await context.storageState({ path: STORAGE_STATE });
  await context.close();
});

import { expect, test, type Page } from "@playwright/test";

import {
  createTestItem,
  itemExists,
  removeTestItem,
  type SeededTestItem,
} from "./helpers/items";

/**
 * Covers the delete path through DeleteItemDialog, ItemDrawer and
 * ItemDrawerProvider. Every spec operates on a throwaway item created for it,
 * so seeded data (asserted by `npm run db:test`) is never touched.
 */

const drawer = (page: Page) => page.locator('[data-slot="sheet-content"]');
const dialog = (page: Page) => page.locator('[data-slot="alert-dialog-content"]');
const deleteTrigger = (page: Page) =>
  drawer(page).getByRole("button", { name: "Delete item" });
const confirmButton = (page: Page) =>
  dialog(page).getByRole("button", { name: "Delete", exact: true });
const toast = (page: Page) => page.locator("[data-sonner-toast]");

async function openDrawer(page: Page, item: SeededTestItem) {
  await page.getByRole("button", { name: `Open ${item.title}` }).click();
  await expect(drawer(page)).toBeVisible();
  await expect(drawer(page).getByRole("heading", { name: item.title })).toBeVisible();
}

async function openConfirmation(page: Page, item: SeededTestItem) {
  await openDrawer(page, item);
  await deleteTrigger(page).click();
  await expect(dialog(page)).toBeVisible();
}

let item: SeededTestItem;
let suffix: string;

test.beforeEach(async ({}, testInfo) => {
  // Full sanitized title, not a truncated one: two titles sharing a prefix
  // would otherwise map to the same item id.
  suffix = testInfo.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  item = await createTestItem(suffix);
});

test.afterEach(async () => {
  await removeTestItem(item.id);
});

test.describe("ItemDrawer — delete affordance", () => {
  test("exposes an enabled delete button (no longer a placeholder)", async ({ page }) => {
    await page.goto("/items/snippets");
    await openDrawer(page, item);

    await expect(deleteTrigger(page)).toBeEnabled();
    await expect(deleteTrigger(page)).toHaveAttribute("title", "Delete item");
    // No action in this bar is a placeholder any more — Favorite and Pin were
    // the last two, and both are live.
    await expect(drawer(page).getByRole("button", { name: /coming soon/i })).toHaveCount(0);
  });
});

test.describe("ItemDrawer — a card whose item is already gone", () => {
  /**
   * Opening a card that no longer resolves — the window after a delete before
   * the list re-renders — must read as a missing item, not as a transport
   * failure. Deleting the row out of band makes that state deterministic: the
   * card is stale and nothing was cached, so the open has to hit the API.
   */
  test("reports the item as unavailable rather than as a failure", async ({ page }) => {
    await page.goto("/items/snippets");
    const card = page.getByRole("button", { name: `Open ${item.title}` });
    await expect(card).toBeVisible();

    await removeTestItem(item.id);
    await card.click();

    await expect(drawer(page)).toContainText("Item unavailable");
    await expect(drawer(page)).toContainText("may have been deleted");
    await expect(drawer(page)).not.toContainText("Something went wrong");
  });
});

test.describe("DeleteItemDialog — confirmation", () => {
  test("names the item being deleted", async ({ page }) => {
    await page.goto("/items/snippets");
    await openConfirmation(page, item);

    await expect(dialog(page).getByRole("heading")).toHaveText("Delete this item?");
    await expect(dialog(page)).toContainText(item.title);
    await expect(dialog(page)).toContainText("cannot be undone");
  });

  test("cancel closes only the dialog and keeps the item", async ({ page }) => {
    await page.goto("/items/snippets");
    await openConfirmation(page, item);

    await dialog(page).getByRole("button", { name: "Cancel" }).click();

    await expect(dialog(page)).toHaveCount(0);
    await expect(drawer(page)).toBeVisible();
    await expect(toast(page)).toHaveCount(0);
    expect(await itemExists(item.id)).toBe(true);
  });

  test("escape closes only the dialog, leaving the drawer open", async ({ page }) => {
    await page.goto("/items/snippets");
    await openConfirmation(page, item);

    await page.keyboard.press("Escape");

    await expect(dialog(page)).toHaveCount(0);
    await expect(drawer(page)).toBeVisible();
    expect(await itemExists(item.id)).toBe(true);
  });

  test("an outside click dismisses neither surface", async ({ page }) => {
    await page.goto("/items/snippets");
    await openConfirmation(page, item);

    await page.mouse.click(80, 600);

    await expect(dialog(page)).toBeVisible();
    await expect(drawer(page)).toBeVisible();
    expect(await itemExists(item.id)).toBe(true);
  });
});

test.describe("ItemDrawerProvider — after a confirmed delete", () => {
  test("toasts, closes the drawer and drops the card from a type list", async ({ page }) => {
    await page.goto("/items/snippets");
    await openConfirmation(page, item);

    await confirmButton(page).click();

    await expect(toast(page)).toHaveText("Item deleted");
    await expect(dialog(page)).toHaveCount(0);
    await expect(drawer(page)).toHaveCount(0);
    // router.refresh() re-renders the server component list without the item.
    await expect(
      page.getByRole("button", { name: `Open ${item.title}` }),
    ).toHaveCount(0);
    expect(await itemExists(item.id)).toBe(false);
  });

  test("drops the card from the dashboard lists too", async ({ page }) => {
    await page.goto("/dashboard");
    await openConfirmation(page, item);

    await confirmButton(page).click();

    await expect(toast(page)).toHaveText("Item deleted");
    await expect(
      page.getByRole("button", { name: `Open ${item.title}` }),
    ).toHaveCount(0);
    expect(await itemExists(item.id)).toBe(false);
  });

  /**
   * The provider caches fetched details in a Map, so a delete must *evict* the
   * entry rather than leave it: otherwise re-opening that id would replay the
   * stale copy without refetching.
   *
   * Recreating the same id with a new title makes the difference observable —
   * evicted means the drawer refetches and shows the new title, kept means it
   * renders the pre-delete ghost. The control assertion first proves the cache
   * genuinely survives the client-side navigation, so a wiped cache cannot make
   * this pass for the wrong reason.
   */
  test("evicts the detail cache so a recreated id cannot render a ghost", async ({ page }) => {
    await page.goto("/items/snippets");

    const control = page.getByRole("button", { name: "Open useDebounce Hook" });
    await control.click();
    await expect(drawer(page).getByRole("heading", { name: "useDebounce Hook" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer(page)).toHaveCount(0);

    // Cache the throwaway too, then delete it through the UI.
    await openDrawer(page, item);
    await page.keyboard.press("Escape");
    await expect(drawer(page)).toHaveCount(0);

    await openConfirmation(page, item);
    await confirmButton(page).click();
    await expect(toast(page)).toHaveText("Item deleted");
    await expect(page.getByRole("button", { name: `Open ${item.title}` })).toHaveCount(0);

    const recreated = await createTestItem(suffix, "E2E ghost check RECREATED");
    expect(recreated.id).toBe(item.id);

    // Client-side navigation within the same layout keeps the provider — and
    // therefore its cache — mounted, while re-rendering the list from the DB.
    await page.getByRole("link", { name: "Command", exact: true }).click();
    await page.waitForURL("**/items/commands");
    await page.getByRole("link", { name: "Snippet", exact: true }).click();
    await page.waitForURL("**/items/snippets");

    // Counting depends on the suite running single-worker (`workers: 1`,
    // `fullyParallel: false`): the listener is registered after the navigation,
    // so a parallel run could deliver request events out of order and make the
    // control assertion below vacuously pass.
    let detailRequests = 0;
    page.on("request", request => {
      if (request.url().includes("/api/items/")) detailRequests += 1;
    });

    // Control: the untouched item is still cached, so opening it hits no network.
    await control.click();
    await expect(drawer(page).getByRole("heading", { name: "useDebounce Hook" })).toBeVisible();
    expect(detailRequests).toBe(0);
    await page.keyboard.press("Escape");
    await expect(drawer(page)).toHaveCount(0);

    // The deleted-then-recreated id must refetch and show the new title.
    await page.getByRole("button", { name: `Open ${recreated.title}` }).click();
    await expect(
      drawer(page).getByRole("heading", { name: recreated.title }),
    ).toBeVisible();
    await expect(drawer(page)).not.toContainText(item.title);
    expect(detailRequests).toBeGreaterThan(0);
  });
});

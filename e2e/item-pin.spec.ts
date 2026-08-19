import { expect, test, type Page } from "@playwright/test";

import {
  backdateTestItem,
  createTestItem,
  removeTestItem,
  type SeededTestItem,
} from "./helpers/items";

/**
 * Covers the pin path through ItemPinButton, ItemDrawer and ItemDrawerProvider,
 * plus the pinned-first ordering on the paginated listings. Every spec works on
 * throwaway items, so the seeded rows `npm run db:test` asserts on stay intact.
 */

const drawer = (page: Page) => page.locator('[data-slot="sheet-content"]');
const pinButton = (page: Page) =>
  drawer(page).getByRole("button", { name: "Pin", exact: true });
const unpinButton = (page: Page) =>
  drawer(page).getByRole("button", { name: "Unpin", exact: true });
const toast = (page: Page) => page.locator("[data-sonner-toast]");
/** The drawer footer's "Updated <date>" text. */
const updatedFooter = (page: Page) =>
  drawer(page).locator("span", { hasText: /^Updated / });
const editButton = (page: Page) =>
  drawer(page).getByRole("button", { name: "Edit item" });
const cancelButton = (page: Page) =>
  drawer(page).getByRole("button", { name: "Cancel" });

async function openDrawer(page: Page, item: SeededTestItem) {
  await page.getByRole("button", { name: `Open ${item.title}` }).click();
  await expect(drawer(page)).toBeVisible();
  await expect(drawer(page).getByRole("heading", { name: item.title })).toBeVisible();
}

async function closeDrawer(page: Page) {
  await page.keyboard.press("Escape");
  await expect(drawer(page)).toBeHidden();
}

/** The card wrapper for an item, so its own pin indicator can be inspected. */
const card = (page: Page, item: SeededTestItem) =>
  page.getByRole("button", { name: `Open ${item.title}` });

/** Titles of the cards in the listing, in DOM order. */
async function listedTitles(page: Page): Promise<string[]> {
  const labels = await page
    .locator('main [aria-label^="Open "]')
    .evaluateAll(nodes =>
      nodes.map(node => node.getAttribute("aria-label") ?? ""),
    );
  return labels.map(label => label.replace(/^Open /, ""));
}

let item: SeededTestItem;

test.beforeEach(async ({}, testInfo) => {
  // Full sanitized title, not a truncated one: two titles sharing a prefix
  // would otherwise map to the same item id.
  const suffix = testInfo.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  item = await createTestItem(suffix);
});

test.afterEach(async () => {
  await removeTestItem(item.id);
});

test.describe("ItemDrawer — pin affordance", () => {
  test("exposes an enabled pin button, not a placeholder", async ({ page }) => {
    await page.goto("/items/snippets");
    await openDrawer(page, item);

    await expect(pinButton(page)).toBeEnabled();
    await expect(pinButton(page)).toHaveAttribute("title", "Pin");
    // It used to render as `disabled` with a "Pin — coming soon" title.
    await expect(
      drawer(page).getByRole("button", { name: /coming soon/i }),
    ).toHaveCount(0);
  });

  test("flips the label and toasts when pinned, and again when unpinned", async ({
    page,
  }) => {
    await page.goto("/items/snippets");
    await openDrawer(page, item);

    await pinButton(page).click();
    await expect(unpinButton(page)).toBeVisible();
    await expect(toast(page)).toContainText("Item pinned");

    await unpinButton(page).click();
    await expect(pinButton(page)).toBeVisible();
    await expect(toast(page).last()).toContainText("Item unpinned");
  });
});

test.describe("ItemCard — pin indicator", () => {
  test("shows no indicator while the item is unpinned", async ({ page }) => {
    await page.goto("/items/snippets");

    await expect(card(page, item).getByRole("img", { name: "Pinned" })).toHaveCount(0);
  });

  test("marks the card once pinned, without adding a second toggle", async ({
    page,
  }) => {
    await page.goto("/items/snippets");
    await openDrawer(page, item);
    await pinButton(page).click();
    await expect(toast(page)).toContainText("Item pinned");
    await closeDrawer(page);

    await expect(card(page, item).getByRole("img", { name: "Pinned" })).toBeVisible();
    // Indicator only, per spec: pinning stays a drawer action, so the card must
    // not grow a Pin/Unpin button beside its favourite star.
    await expect(
      card(page, item).getByRole("button", { name: /^(Pin|Unpin)$/ }),
    ).toHaveCount(0);
  });
});

test.describe("pinned-first ordering", () => {
  let newer: SeededTestItem;

  test.afterEach(async () => {
    if (newer) await removeTestItem(newer.id);
  });

  test("lifts a pinned item above an item updated more recently", async ({
    page,
  }) => {
    await page.goto("/items/snippets");
    await openDrawer(page, item);
    await pinButton(page).click();
    await expect(toast(page)).toContainText("Item pinned");
    await closeDrawer(page);

    // Created *after* the pin, so it wins on `updatedAt` outright. Without the
    // pinned-first sort key this item would head the list, which is what stops
    // this assertion from passing for the wrong reason.
    newer = await createTestItem("pin_ordering_newer");
    await page.goto("/items/snippets");

    const titles = await listedTitles(page);
    expect(titles.indexOf(item.title)).toBeLessThan(titles.indexOf(newer.title));
    expect(titles[0]).toBe(item.title);
  });
});

test.describe("ItemDrawer — footer timestamp after a toggle", () => {
  test("moves Updated forward, rather than showing the pre-toggle date", async ({
    page,
  }) => {
    // The item is created now, and formatIsoDate renders only the day — so
    // without an older starting point a stale timestamp and a fresh one would
    // look identical.
    await backdateTestItem(item.id, "2026-04-20T10:00:00.000Z");
    const today = new Date().toISOString().slice(0, 10);

    await page.goto("/items/snippets");
    await openDrawer(page, item);
    await expect(updatedFooter(page)).toHaveText("Updated 2026-04-20");

    // A pin is a write, so @updatedAt moves. The footer reads the same object
    // the toggle patches, so it has to move with it.
    await pinButton(page).click();
    await expect(unpinButton(page)).toBeVisible();
    await expect(updatedFooter(page)).toHaveText(`Updated ${today}`);

    // And the patched value has to survive a reopen, not just the live render.
    await closeDrawer(page);
    await openDrawer(page, item);
    await expect(updatedFooter(page)).toHaveText(`Updated ${today}`);
  });
});

test.describe("ItemDrawerProvider — detail state after a toggle", () => {
  test("keeps the pin state through an edit that is cancelled", async ({
    page,
  }) => {
    await page.goto("/items/snippets");
    await openDrawer(page, item);
    await pinButton(page).click();
    await expect(unpinButton(page)).toBeVisible();

    // ItemViewMode unmounts entirely while editing, so on cancel the action bar
    // remounts straight from the provider's item state. If that state still held
    // the pre-toggle flag, the button would offer to pin an already-pinned item.
    await editButton(page).click();
    await expect(cancelButton(page)).toBeVisible();
    await cancelButton(page).click();

    await expect(unpinButton(page)).toBeVisible();
    await expect(pinButton(page)).toHaveCount(0);
  });

  test("does not replay the old pin state when the drawer is reopened", async ({
    page,
  }) => {
    await page.goto("/items/snippets");

    // The first open populates the detail cache with `isPinned: false`.
    await openDrawer(page, item);
    await pinButton(page).click();
    await expect(unpinButton(page)).toBeVisible();
    await closeDrawer(page);

    // Reopening must not serve that stale entry back.
    await openDrawer(page, item);
    await expect(unpinButton(page)).toBeVisible();
    await expect(pinButton(page)).toHaveCount(0);
  });
});

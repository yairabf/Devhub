import { expect, test, type Page } from "@playwright/test";

import {
  createTestItem,
  removeTestItem,
  type SeededTestItem,
} from "./helpers/items";

/**
 * Covers the favourite path where it crosses surfaces: a toggle made from a
 * *card* has to reach the detail `ItemDrawerProvider` is holding, not just the
 * card's own optimistic state. Card and row stars are server-component call
 * sites, so the sync arrives through `ItemDrawerContext` rather than a prop.
 *
 * Every spec works on a throwaway item, so the seeded rows `npm run db:test`
 * asserts on stay intact.
 */

const drawer = (page: Page) => page.locator('[data-slot="sheet-content"]');
const drawerFavoriteButton = (page: Page) =>
  drawer(page).getByRole("button", { name: "Favorite", exact: true });
const drawerUnfavoriteButton = (page: Page) =>
  drawer(page).getByRole("button", { name: "Unfavorite", exact: true });

/**
 * The card wrapper for an item, so its own star can be scoped to it. `exact`
 * matters: accessible-name matching is substring by default, so "E2E favourite 1"
 * would also match "E2E favourite 10" once this file grows past nine specs.
 */
const card = (page: Page, item: SeededTestItem) =>
  page.getByRole("button", { name: `Open ${item.title}`, exact: true });
const cardFavoriteButton = (page: Page, item: SeededTestItem) =>
  card(page, item).getByRole("button", { name: "Favorite", exact: true });
const cardUnfavoriteButton = (page: Page, item: SeededTestItem) =>
  card(page, item).getByRole("button", { name: "Unfavorite", exact: true });

const editButton = (page: Page) =>
  drawer(page).getByRole("button", { name: "Edit item" });
const cancelButton = (page: Page) =>
  drawer(page).getByRole("button", { name: "Cancel" });

async function openDrawer(page: Page, item: SeededTestItem) {
  await card(page, item).click();
  await expect(drawer(page)).toBeVisible();
  await expect(drawer(page).getByRole("heading", { name: item.title })).toBeVisible();
}

async function closeDrawer(page: Page) {
  await page.keyboard.press("Escape");
  await expect(drawer(page)).toBeHidden();
}

let item: SeededTestItem;
let seq = 0;

test.beforeEach(async ({}, testInfo) => {
  // Full sanitized title, not a truncated one: two titles sharing a prefix
  // would otherwise map to the same item id.
  const suffix = testInfo.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  // The title is deliberately short and space-separated rather than defaulted
  // from that suffix: one long unbreakable word overflows the card's grid track,
  // and the neighbouring card then paints over this card's star, which makes the
  // star unclickable for reasons that have nothing to do with what is under test.
  item = await createTestItem(suffix, `E2E favourite ${++seq}`);
});

test.afterEach(async () => {
  await removeTestItem(item.id);
});

test.describe("ItemDrawerProvider — favourite toggled from a card", () => {
  test("does not replay the stale favourite state when the drawer is reopened", async ({
    page,
  }) => {
    await page.goto("/items/snippets");

    // Seed the provider's detail cache with `isFavorite: false`. Without this
    // first open the spec is vacuous: a cold `openItem` falls through to the
    // API and would fetch the truth either way.
    await openDrawer(page, item);
    await expect(drawerFavoriteButton(page)).toBeVisible();
    await closeDrawer(page);

    // Toggle from the card, which is where the callback used to be missing.
    await cardFavoriteButton(page, item).click();
    await expect(cardUnfavoriteButton(page, item)).toBeVisible();

    // Reopen with no navigation in between — a reload would wipe the `useRef`
    // cache and hide the bug this spec exists to catch.
    await openDrawer(page, item);
    await expect(drawerUnfavoriteButton(page)).toBeVisible();
    await expect(drawerFavoriteButton(page)).toHaveCount(0);
  });

  test("keeps the card-originated favourite state through a cancelled edit", async ({
    page,
  }) => {
    await page.goto("/items/snippets");

    await openDrawer(page, item);
    await closeDrawer(page);

    await cardFavoriteButton(page, item).click();
    await expect(cardUnfavoriteButton(page, item)).toBeVisible();

    await openDrawer(page, item);
    // ItemViewMode unmounts entirely while editing, so on cancel the action bar
    // remounts straight from the provider's item state.
    await editButton(page).click();
    await expect(cancelButton(page)).toBeVisible();
    await cancelButton(page).click();

    await expect(drawerUnfavoriteButton(page)).toBeVisible();
    await expect(drawerFavoriteButton(page)).toHaveCount(0);
  });
});

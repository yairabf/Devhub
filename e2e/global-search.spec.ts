import { expect, test, type Page } from "@playwright/test";

import { createTestItem, removeTestItem, type SeededTestItem } from "./helpers/items";

/**
 * Covers the Cmd+K / Ctrl+K command palette: opening, fuzzy search across
 * items and collections, keyboard navigation, and both select paths (item
 * drawer, collection navigation). Every spec operates on a throwaway item
 * created for it, so seeded data (asserted by `npm run db:test`) is never
 * touched. Collection search uses the seeded "React Patterns" collection —
 * the fixture links every throwaway item to it, so no throwaway collection is
 * needed.
 */

const palette = (page: Page) => page.getByRole("dialog", { name: "Search" });
const searchInput = (page: Page) => palette(page).getByRole("combobox");
const drawer = (page: Page) => page.locator('[data-slot="sheet-content"]');

async function openPalette(page: Page) {
  const shortcut = process.platform === "darwin" ? "Meta+k" : "Control+k";

  // The shortcut is served by a keydown listener attached in a client effect,
  // so it does nothing until the page has hydrated — and `goto` resolves
  // before that. A single press is therefore droppable, which showed up as an
  // intermittent failure under full-suite load. Retrying is safe because the
  // handler only ever opens the palette; it never toggles it shut.
  await expect
    .poll(async () => {
      await page.keyboard.press(shortcut);
      return palette(page).isVisible();
    })
    .toBe(true);
}

let item: SeededTestItem;
let suffix: string;

test.beforeEach(async ({}, testInfo) => {
  suffix = testInfo.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  item = await createTestItem(suffix);
});

test.afterEach(async () => {
  await removeTestItem(item.id);
});

test.describe("Command palette", () => {
  test("opens with Cmd+K / Ctrl+K", async ({ page }) => {
    await page.goto("/dashboard");
    await openPalette(page);
    await expect(searchInput(page)).toBeFocused();
  });

  test("finds an item by title under Items and opens its drawer on select", async ({ page }) => {
    await page.goto("/dashboard");
    await openPalette(page);
    await searchInput(page).fill(item.title);

    const itemOption = palette(page).getByRole("option", { name: item.title });
    await expect(itemOption).toBeVisible();
    await expect(palette(page).getByText("Items", { exact: true })).toBeVisible();
    // The row names its type as well as glyphing it (the fixture defaults to a
    // snippet). Asserted so the field keeps a reader — it was fetched but
    // rendered nowhere until this was fixed.
    await expect(itemOption).toContainText("Snippet");

    await itemOption.click();

    await expect(palette(page)).toBeHidden();
    await expect(drawer(page).getByRole("heading", { name: item.title })).toBeVisible();
  });

  test("finds a collection by name under Collections and navigates on select", async ({ page }) => {
    await page.goto("/dashboard");
    await openPalette(page);
    await searchInput(page).fill("React Patterns");

    const collectionOption = palette(page).getByRole("option", {
      name: /React Patterns/,
    });
    await expect(collectionOption).toBeVisible();
    await expect(palette(page).getByText("Collections", { exact: true })).toBeVisible();

    await collectionOption.click();

    await expect(palette(page)).toBeHidden();
    await expect(page).toHaveURL(/\/collections\/col_react_patterns$/);
  });

  test("arrow keys move the highlight and Enter selects the highlighted result", async ({ page }) => {
    // Needs two matching results, which the shared per-test item cannot supply
    // on its own: with a single option, `autoHighlight="always"` has already
    // highlighted it, ArrowDown is a no-op, and the spec would pass unchanged
    // with the keypress removed — proving only that Enter selects.
    // The token is deliberately absent from every seeded title and collection
    // name, so the two options below are the whole result set.
    const token = "Zqarrow";
    const first = await createTestItem("arrow_first", `${token} alpha`);
    const second = await createTestItem("arrow_second", `${token} beta`);

    try {
      await page.goto("/dashboard");
      await openPalette(page);
      await searchInput(page).fill(token);

      const options = palette(page).getByRole("option");
      await expect(options).toHaveCount(2);

      // Which of the two ranks first is a scoring detail, so derive the
      // second from what actually rendered — the assertion is that the
      // highlight *moves*, not where it lands.
      const firstText = (await options.nth(0).textContent()) ?? "";
      const secondTitle = firstText.includes("alpha")
        ? `${token} beta`
        : `${token} alpha`;

      await expect(options.nth(0)).toHaveAttribute("data-highlighted", "");
      await page.keyboard.press("ArrowDown");
      await expect(options.nth(1)).toHaveAttribute("data-highlighted", "");
      await expect(options.nth(0)).not.toHaveAttribute("data-highlighted", "");

      await page.keyboard.press("Enter");

      await expect(
        drawer(page).getByRole("heading", { name: secondTitle }),
      ).toBeVisible();
    } finally {
      await removeTestItem(first.id);
      await removeTestItem(second.id);
    }
  });

  test("shows a no-results message for a query that matches nothing", async ({ page }) => {
    await page.goto("/dashboard");
    await openPalette(page);
    await searchInput(page).fill("zzzz_no_such_result_zzzz");

    await expect(palette(page)).toContainText("No results found.");
  });

  test("closes on Escape without navigating away", async ({ page }) => {
    await page.goto("/dashboard");
    await openPalette(page);
    await searchInput(page).fill(item.title);

    await page.keyboard.press("Escape");

    await expect(palette(page)).toBeHidden();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("opens from the /items/[type] page too", async ({ page }) => {
    await page.goto("/items/snippets");
    await openPalette(page);
    await searchInput(page).fill(item.title);

    await expect(palette(page).getByRole("option", { name: item.title })).toBeVisible();
  });
});

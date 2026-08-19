import { expect, test, type Page } from "@playwright/test";

import {
  createTestCollections,
  createTestItems,
  removeTestCollections,
  removeTestItems,
} from "./helpers/items";

/**
 * Covers pagination on the item and collection listings: page size, prev/next
 * availability, numbered links, and how out-of-range or junk `?page=` values
 * resolve.
 *
 * Seeded data is far short of a full page, so the suite bulk-creates its own
 * throwaway rows under shared prefixes and deletes them afterwards — the
 * seeded rows `npm run db:test` asserts on are never touched. Every throwaway
 * item is a snippet linked to "React Patterns", so one batch fills both the
 * by-type and collection-detail listings; the collections list gets its own
 * batch of throwaway collections.
 */

const ITEMS_PER_PAGE = 21;
const COLLECTIONS_PER_PAGE = 21;
const PREFIX = "paging";
const COLLECTION_PREFIX = "pagingcol";
/** Enough to overflow a page of either kind, with a partial second page. */
const EXTRA_ROWS = 25;

/**
 * Item and collection cards share one locator: both `ItemCardTrigger` and
 * `CollectionCardTrigger` label themselves `Open <title>`, and no page renders
 * both. Scoped to `main` because the TopBar's hamburger is labelled "Open
 * menu", which the same regex would otherwise sweep up as an extra card.
 */
const cards = (page: Page) =>
  page.locator("main").getByRole("button", { name: /^Open / });
const pager = (page: Page) => page.getByRole("navigation", { name: "Pagination" });
const prev = (page: Page) => pager(page).getByLabel("Previous page");
const next = (page: Page) => pager(page).getByLabel("Next page");

test.beforeAll(async () => {
  await createTestItems(PREFIX, EXTRA_ROWS);
});

test.afterAll(async () => {
  await removeTestItems(PREFIX);
});

test.describe("Pagination — items by type", () => {
  test("shows a full page and no more", async ({ page }) => {
    await page.goto("/items/snippets");

    await expect(cards(page)).toHaveCount(ITEMS_PER_PAGE);
    await expect(pager(page)).toBeVisible();
  });

  test("greys out Previous on the first page and offers Next", async ({ page }) => {
    await page.goto("/items/snippets");

    // Disabled controls are spans, not links — an <a> cannot be disabled.
    await expect(prev(page)).toHaveAttribute("aria-disabled", "true");
    await expect(prev(page)).not.toHaveAttribute("href", /./);
    await expect(next(page)).toHaveAttribute("href", "/items/snippets?page=2");
  });

  test("Next advances to the last page, where Next is greyed out instead", async ({ page }) => {
    await page.goto("/items/snippets");
    await next(page).click();

    await expect(page).toHaveURL(/\/items\/snippets\?page=2$/);
    await expect(next(page)).toHaveAttribute("aria-disabled", "true");
    await expect(prev(page)).toHaveAttribute("href", "/items/snippets");

    // The throwaways plus the seeded snippets, minus one full first page.
    const remaining = await cards(page).count();
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(ITEMS_PER_PAGE);
  });

  test("shows different items on page 2 than page 1", async ({ page }) => {
    await page.goto("/items/snippets");
    const firstPage = await cards(page).evaluateAll(nodes =>
      nodes.map(node => node.getAttribute("aria-label")),
    );

    await page.goto("/items/snippets?page=2");
    const secondPage = await cards(page).evaluateAll(nodes =>
      nodes.map(node => node.getAttribute("aria-label")),
    );

    expect(secondPage.length).toBeGreaterThan(0);
    expect(firstPage.some(label => secondPage.includes(label))).toBe(false);
  });

  test("navigates by numbered page link", async ({ page }) => {
    await page.goto("/items/snippets");

    await pager(page).getByRole("link", { name: "Page 2" }).click();

    await expect(page).toHaveURL(/\?page=2$/);
    await expect(
      pager(page).getByRole("link", { name: "Page 2" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("clamps a page past the end to the last page", async ({ page }) => {
    await page.goto("/items/snippets?page=99");

    // Clamped, not empty — the grid still renders the last page's items.
    await expect(cards(page).first()).toBeVisible();
    await expect(next(page)).toHaveAttribute("aria-disabled", "true");
  });

  // A loop rather than one spec with three navigations, so a failure names
  // the input that broke.
  for (const raw of ["abc", "0", "-1", "1.5"]) {
    test(`falls back to the first page for ?page=${raw}`, async ({ page }) => {
      await page.goto(`/items/snippets?page=${raw}`);

      await expect(cards(page)).toHaveCount(ITEMS_PER_PAGE);
      await expect(prev(page)).toHaveAttribute("aria-disabled", "true");
    });
  }

  test("renders no pager at all when everything fits on one page", async ({ page }) => {
    // Links are untouched by the fixture, and seeded links are far below a page.
    await page.goto("/items/links");

    await expect(cards(page).first()).toBeVisible();
    await expect(pager(page)).toHaveCount(0);
  });
});

test.describe("Pagination — collection detail", () => {
  test("paginates the items inside a collection", async ({ page }) => {
    await page.goto("/collections/col_react_patterns");

    await expect(cards(page)).toHaveCount(ITEMS_PER_PAGE);
    await expect(next(page)).toHaveAttribute(
      "href",
      "/collections/col_react_patterns?page=2",
    );
  });

  test("reports the collection's whole size in the header, not the page's", async ({ page }) => {
    await page.goto("/collections/col_react_patterns");

    // The header used to print `items.length`, which after paging would have
    // read "21 items" for a collection holding far more.
    const headerCount = await page
      .getByText(/^\d+ items?$/)
      .first()
      .textContent();
    const total = Number(headerCount?.match(/\d+/)?.[0]);

    expect(total).toBeGreaterThan(await cards(page).count());
    // The throwaways plus whatever the collection already held — strictly
    // more than the batch alone, so this cannot pass on a page-sized count.
    expect(total).toBeGreaterThan(EXTRA_ROWS);
  });
});

test.describe("Pagination — collections list", () => {
  test.beforeAll(async () => {
    await createTestCollections(COLLECTION_PREFIX, EXTRA_ROWS);
  });

  test.afterAll(async () => {
    await removeTestCollections(COLLECTION_PREFIX);
  });

  test("shows a full page of collections and no more", async ({ page }) => {
    await page.goto("/collections");

    await expect(cards(page)).toHaveCount(COLLECTIONS_PER_PAGE);
    await expect(next(page)).toHaveAttribute("href", "/collections?page=2");
  });

  test("Next advances to the last page, where Next is greyed out", async ({ page }) => {
    await page.goto("/collections");
    await next(page).click();

    await expect(page).toHaveURL(/\/collections\?page=2$/);
    await expect(next(page)).toHaveAttribute("aria-disabled", "true");
    await expect(prev(page)).toHaveAttribute("href", "/collections");
    expect(await cards(page).count()).toBeGreaterThan(0);
  });

  test("counts every collection in the heading, not just this page", async ({ page }) => {
    await page.goto("/collections");

    const heading = await page.getByText(/^\d+ collections?/).first().textContent();
    const total = Number(heading?.match(/\d+/)?.[0]);

    expect(total).toBeGreaterThan(COLLECTIONS_PER_PAGE);
  });
});

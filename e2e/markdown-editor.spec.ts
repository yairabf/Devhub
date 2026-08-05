import { expect, test, type Page } from "@playwright/test";

import { codeEditor } from "./helpers/code-editor";
import {
  markdownEditor,
  markdownInput,
  markdownPaneHeight,
  markdownPreview,
  markdownTab,
  showMarkdownTab,
} from "./helpers/markdown-editor";
import {
  createTestItem,
  findItemByTitle,
  removeTestItem,
  type SeededTestItem,
} from "./helpers/items";

/**
 * Covers the Markdown editor: which types get it, the read-only/edit split, what
 * the Preview pane renders, the shared 400px cap, and whether source survives a
 * round trip. Editing happens on a throwaway note so seeded data (asserted by
 * `npm run db:test`) stays intact.
 */

const drawer = (page: Page) => page.locator('[data-slot="sheet-content"]');
const dialog = (page: Page) => page.locator('[data-slot="dialog-content"]');
const toast = (page: Page) => page.locator("[data-sonner-toast]");

const SEEDED_PROMPT = "Refactoring Assistant";
const SEEDED_SNIPPET = "useDebounce Hook";

async function openItem(page: Page, title: string) {
  await page.getByRole("button", { name: `Open ${title}` }).click();
  await expect(drawer(page).getByRole("heading", { name: title })).toBeVisible();
}

async function enterEditMode(page: Page) {
  await drawer(page).getByRole("button", { name: "Edit item" }).click();
  await expect(drawer(page).getByRole("button", { name: "Save" })).toBeVisible();
}

test.describe("MarkdownEditor — which types get it", () => {
  test("a prompt renders in the Markdown editor, not a preformatted block", async ({
    page,
  }) => {
    await page.goto("/items/prompts");
    await openItem(page, SEEDED_PROMPT);

    await expect(markdownEditor(drawer(page))).toBeVisible();
    // Replaces the <pre> the drawer used to render for prose types.
    await expect(drawer(page).locator("pre")).toHaveCount(0);
    await expect(codeEditor(drawer(page))).toHaveCount(0);
  });

  test("a snippet keeps the code editor", async ({ page }) => {
    await page.goto("/items/snippets");
    await openItem(page, SEEDED_SNIPPET);

    await expect(codeEditor(drawer(page))).toBeVisible();
    await expect(markdownEditor(drawer(page))).toHaveCount(0);
  });
});

test.describe("MarkdownEditor — read-only display", () => {
  test("shows only a Preview label, with no tab to switch to", async ({
    page,
  }) => {
    await page.goto("/items/prompts");
    await openItem(page, SEEDED_PROMPT);

    const editor = markdownEditor(drawer(page));
    await expect(editor).toHaveAttribute("data-markdown-editor", "read-only");
    await expect(editor).toContainText("Preview");
    // A single tab would be a tablist that navigates nowhere.
    await expect(editor.getByRole("tablist")).toHaveCount(0);
    await expect(markdownInput(drawer(page))).toHaveCount(0);
  });

  test("offers a copy button for the source", async ({ page }) => {
    await page.goto("/items/prompts");
    await openItem(page, SEEDED_PROMPT);

    await expect(
      markdownEditor(drawer(page)).getByRole("button", { name: /^Copy/ }),
    ).toBeVisible();
  });
});

test.describe("MarkdownEditor — editing", () => {
  let item: SeededTestItem;

  test.beforeEach(async ({}, testInfo) => {
    item = await createTestItem(
      testInfo.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase(),
      "",
      "type_note",
    );
  });

  test.afterEach(async () => {
    await removeTestItem(item.id);
  });

  test("opens on the Write tab with Preview available", async ({ page }) => {
    await page.goto("/items/notes");
    await openItem(page, item.title);
    await enterEditMode(page);

    await expect(markdownTab(drawer(page), "Write")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(markdownTab(drawer(page), "Preview")).toHaveAttribute(
      "aria-selected",
      "false",
    );
    await expect(markdownInput(drawer(page))).toBeVisible();
  });

  test("moves between tabs with the arrow keys", async ({ page }) => {
    await page.goto("/items/notes");
    await openItem(page, item.title);
    await enterEditMode(page);

    await markdownTab(drawer(page), "Write").focus();
    await page.keyboard.press("ArrowRight");

    await expect(markdownTab(drawer(page), "Preview")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(markdownPreview(drawer(page))).toBeVisible();
  });

  test("previews what was typed without saving first", async ({ page }) => {
    await page.goto("/items/notes");
    await openItem(page, item.title);
    await enterEditMode(page);
    await markdownInput(drawer(page)).fill("## Draft heading\n\nSome prose.");
    await showMarkdownTab(drawer(page), "Preview");

    await expect(
      markdownPreview(drawer(page)).getByRole("heading", {
        name: "Draft heading",
      }),
    ).toBeVisible();
  });

  /**
   * The point of the exercise: Markdown source is whitespace-significant (a
   * trailing newline separates blocks, indentation makes a code block), so the
   * editor must not trim or reflow what it is handed. Asserted against the stored
   * row rather than the rendered preview.
   */
  test("stores the source it was given, byte for byte", async ({ page }) => {
    const content = "# Title\n\n- one\n- two\n\n    indented code\n";

    await page.goto("/items/notes");
    await openItem(page, item.title);
    await enterEditMode(page);
    await markdownInput(drawer(page)).fill(content);
    await drawer(page).getByRole("button", { name: "Save" }).click();

    await expect(toast(page)).toHaveText("Item saved");
    expect((await findItemByTitle(item.title))?.content).toBe(content);
  });

  test("discards edits on cancel", async ({ page }) => {
    const before = (await findItemByTitle(item.title))?.content;

    await page.goto("/items/notes");
    await openItem(page, item.title);
    await enterEditMode(page);
    await markdownInput(drawer(page)).fill("# Discarded\n");
    await drawer(page).getByRole("button", { name: "Cancel" }).click();

    await expect(drawer(page).getByRole("button", { name: "Save" })).toHaveCount(
      0,
    );
    expect((await findItemByTitle(item.title))?.content).toBe(before);
  });

  test("names the Write pane for assistive tech, since it has no label element", async ({
    page,
  }) => {
    await page.goto("/items/notes");
    await openItem(page, item.title);
    await enterEditMode(page);

    // The pane unmounts when Preview is active, so a <label for> would dangle.
    await expect(markdownInput(drawer(page))).toHaveAttribute(
      "aria-label",
      "Content",
    );
    await expect(
      drawer(page).locator('label[for="item-content"]'),
    ).toHaveCount(0);
  });
});

test.describe("MarkdownEditor — Preview rendering", () => {
  let item: SeededTestItem;

  test.beforeEach(async ({}, testInfo) => {
    item = await createTestItem(
      testInfo.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase(),
      "",
      "type_note",
    );
  });

  test.afterEach(async () => {
    await removeTestItem(item.id);
  });

  async function previewOf(page: Page, source: string) {
    await page.goto("/items/notes");
    await openItem(page, item.title);
    await enterEditMode(page);
    await markdownInput(drawer(page)).fill(source);
    await showMarkdownTab(drawer(page), "Preview");
    return markdownPreview(drawer(page));
  }

  test("renders GitHub-flavoured tables, task lists and strikethrough", async ({
    page,
  }) => {
    const preview = await previewOf(
      page,
      [
        "| A | B |",
        "| --- | --- |",
        "| 1 | 2 |",
        "",
        "- [x] done",
        "- [ ] pending",
        "",
        "~~struck~~",
      ].join("\n"),
    );

    // All three come from remark-gfm; none of them parse as plain Markdown.
    await expect(preview.locator("table th")).toHaveText(["A", "B"]);
    await expect(preview.locator('input[type="checkbox"]')).toHaveCount(2);
    await expect(preview.locator("del")).toHaveText("struck");
  });

  /**
   * `rehype-raw` is deliberately absent, so HTML in stored content stays text.
   * Without that, item content would be an injection route into the drawer.
   */
  test("leaves raw HTML as text instead of rendering it", async ({ page }) => {
    const preview = await previewOf(page, "A <b>bold</b> <script>x</script> tag");

    await expect(preview.locator("b")).toHaveCount(0);
    await expect(preview.locator("script")).toHaveCount(0);
    await expect(preview).toContainText("<b>bold</b>");
  });

  test("opens links in a new tab without handing over the opener", async ({
    page,
  }) => {
    const preview = await previewOf(page, "[example](https://example.com)");
    const link = preview.getByRole("link", { name: "example" });

    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  /**
   * Task-list checkboxes are the only native controls in the preview, and the app
   * themes with a class rather than `color-scheme` — so without pinning the scheme
   * the browser paints them from the OS preference, which rendered an unchecked
   * box as a filled dark square on a light page.
   */
  test("pins the native checkbox scheme to the app theme, not the OS", async ({
    page,
  }) => {
    const preview = await previewOf(page, "- [ ] pending");
    const scheme = () =>
      preview
        .locator('input[type="checkbox"]')
        .evaluate(box => getComputedStyle(box).colorScheme);

    // Driven by the `dark` class rather than the top bar's theme switch: the
    // drawer is modal while open, so the switch is inert and unreachable. The
    // switch's own wiring to this class is covered by the theme feature.
    const setDark = (dark: boolean) =>
      page.evaluate(
        on => document.documentElement.classList.toggle("dark", on),
        dark,
      );

    await setDark(true);
    expect(await scheme()).toBe("dark");

    await setDark(false);
    expect(await scheme()).toBe("light");
  });
});

test.describe("MarkdownEditor — height", () => {
  let item: SeededTestItem;

  test.beforeEach(async ({}, testInfo) => {
    item = await createTestItem(
      testInfo.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase(),
      "",
      "type_note",
    );
  });

  test.afterEach(async () => {
    await removeTestItem(item.id);
  });

  /**
   * Both panes share the cap on purpose: if only one were bounded, switching
   * tabs would resize the drawer under the user.
   */
  test("caps both panes at 400px for content that overflows", async ({
    page,
  }) => {
    const long = Array.from({ length: 60 }, (_, i) => `Line ${i + 1}`).join(
      "\n\n",
    );

    await page.goto("/items/notes");
    await openItem(page, item.title);
    await enterEditMode(page);
    await markdownInput(drawer(page)).fill(long);

    expect(await markdownPaneHeight(markdownInput(drawer(page)))).toBe(400);

    await showMarkdownTab(drawer(page), "Preview");
    expect(await markdownPaneHeight(markdownPreview(drawer(page)))).toBe(400);
  });

  test("hugs short content instead of always filling the cap", async ({
    page,
  }) => {
    await page.goto("/items/notes");
    await openItem(page, item.title);
    await enterEditMode(page);
    await markdownInput(drawer(page)).fill("one line");

    const height = await markdownPaneHeight(markdownInput(drawer(page)));
    expect(height).toBeLessThan(400);
    expect(height).toBeGreaterThanOrEqual(56);
  });

  /**
   * The source wraps, so the same text needs a taller box in a narrower pane.
   * Without a width observer the height stays at whatever it was measured at and
   * the text scrolls inside a box that is too short.
   */
  test("re-fits when the pane gets narrower", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/items/notes");
    await openItem(page, item.title);
    await enterEditMode(page);

    // One long line with no newlines: its height depends purely on the width.
    await markdownInput(drawer(page)).fill("word ".repeat(120).trim());
    const wide = await markdownPaneHeight(markdownInput(drawer(page)));

    await page.setViewportSize({ width: 420, height: 800 });

    const narrow = await markdownPaneHeight(markdownInput(drawer(page)));
    expect(narrow).toBeGreaterThan(wide);
    // Grown to fit rather than left scrolling inside a stale box.
    expect(
      await markdownInput(drawer(page)).evaluate(
        box => box.scrollHeight <= box.clientHeight,
      ),
    ).toBe(true);
  });

  test("shrinks again when content is deleted", async ({ page }) => {
    await page.goto("/items/notes");
    await openItem(page, item.title);
    await enterEditMode(page);

    await markdownInput(drawer(page)).fill(
      Array.from({ length: 30 }, (_, i) => `Line ${i + 1}`).join("\n"),
    );
    const tall = await markdownPaneHeight(markdownInput(drawer(page)));

    await markdownInput(drawer(page)).fill("one line");
    const short = await markdownPaneHeight(markdownInput(drawer(page)));

    expect(tall).toBeGreaterThan(short);
  });
});

test.describe("MarkdownEditor — New Item dialog", () => {
  test("swaps between the two editors as the type changes", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "New Item" }).click();
    await expect(dialog(page)).toBeVisible();

    // Snippet is the default selection.
    await expect(codeEditor(dialog(page))).toBeVisible();
    await expect(markdownEditor(dialog(page))).toHaveCount(0);

    await dialog(page).getByText("Note", { exact: true }).click();
    await expect(markdownEditor(dialog(page))).toBeVisible();
    await expect(codeEditor(dialog(page))).toHaveCount(0);

    await dialog(page).getByText("Prompt", { exact: true }).click();
    await expect(markdownEditor(dialog(page))).toBeVisible();

    await dialog(page).getByText("Command", { exact: true }).click();
    await expect(codeEditor(dialog(page))).toBeVisible();
    await expect(markdownEditor(dialog(page))).toHaveCount(0);
  });

  test("carries the draft across a type change", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "New Item" }).click();
    await dialog(page).getByText("Note", { exact: true }).click();
    await markdownInput(dialog(page)).fill("## Carried over");

    await dialog(page).getByText("Prompt", { exact: true }).click();

    await expect(markdownInput(dialog(page))).toHaveValue("## Carried over");
  });
});

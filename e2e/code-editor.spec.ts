import { expect, test, type Page } from "@playwright/test";

import {
  codeEditor,
  codeEditorInput,
  codeEditorSurfaceHeight,
  expectCodeEditorReady,
  setCodeEditorValue,
} from "./helpers/code-editor";
import {
  createTestItem,
  findItemByTitle,
  removeTestItem,
  type SeededTestItem,
} from "./helpers/items";

/**
 * Covers the Monaco-backed CodeEditor: which types get it, its chrome, the
 * 400px cap, and whether content survives a round trip through it. Editing
 * happens on a throwaway item so seeded data (asserted by `npm run db:test`)
 * stays intact; the read-only specs only look at seeded items.
 */

const drawer = (page: Page) => page.locator('[data-slot="sheet-content"]');
const toast = (page: Page) => page.locator("[data-sonner-toast]");

/** Long enough (24 lines of Dockerfile) to overflow the cap. */
const LONG_SNIPPET = "Multi-stage Node Dockerfile";
const SHORT_SNIPPET = "useDebounce Hook";
const PROMPT = "Refactoring Assistant";
const COMMAND = "Pretty git log graph";

async function openItem(page: Page, title: string) {
  await page.getByRole("button", { name: `Open ${title}` }).click();
  await expect(drawer(page).getByRole("heading", { name: title })).toBeVisible();
}

/**
 * Switches the drawer into edit mode and waits for the swap to land. Without
 * the Save barrier the read-only editor is still on screen, and anything typed
 * or pasted goes to an editor that ignores it.
 */
async function enterEditMode(page: Page) {
  await drawer(page).getByRole("button", { name: "Edit item" }).click();
  await expect(drawer(page).getByRole("button", { name: "Save" })).toBeVisible();
}

test.describe("CodeEditor — which types get it", () => {
  test("a snippet's content renders in the editor", async ({ page }) => {
    await page.goto("/items/snippets");
    await openItem(page, SHORT_SNIPPET);

    await expectCodeEditorReady(drawer(page));
    await expect(drawer(page).locator("pre")).toHaveCount(0);
  });

  test("a command's content renders in the editor", async ({ page }) => {
    await page.goto("/items/commands");
    await openItem(page, COMMAND);

    await expectCodeEditorReady(drawer(page));
  });

  // Prose types get the Markdown editor instead; `markdown-editor.spec.ts` owns
  // what that renders, so this only asserts Monaco stays out of it.
  test("a prompt does not get the code editor", async ({ page }) => {
    await page.goto("/items/prompts");
    await openItem(page, PROMPT);

    await expect(drawer(page).locator("[data-markdown-editor]")).toBeVisible();
    await expect(codeEditor(drawer(page))).toHaveCount(0);
  });
});

test.describe("CodeEditor — chrome", () => {
  test("shows three window dots, the language and a copy button", async ({
    page,
  }) => {
    await page.goto("/items/snippets");
    await openItem(page, SHORT_SNIPPET);
    await expectCodeEditorReady(drawer(page));

    const editor = codeEditor(drawer(page));
    await expect(editor.locator("[aria-hidden] > span")).toHaveCount(3);
    // Canonical casing, not the stored "typescript".
    await expect(editor).toContainText("TypeScript");
    await expect(editor.getByRole("button", { name: /^Copy/ })).toBeVisible();
  });

  test("names the surface for assistive tech, since it has no label element", async ({
    page,
  }) => {
    await page.goto("/items/snippets");
    await openItem(page, SHORT_SNIPPET);
    await expectCodeEditorReady(drawer(page));

    await expect(codeEditorInput(drawer(page))).toHaveAttribute(
      "aria-label",
      `${SHORT_SNIPPET} content`,
    );
  });

  /**
   * Monaco's own context menu is an IDE menu — it offers "Command Palette",
   * which opens a quick-input widget inside the item dialog, and it renders
   * inside the editor, so the create dialog's overflow clips it. It stays off
   * and the browser's native menu handles copy/paste.
   */
  test("does not open Monaco's own context menu on right-click", async ({
    page,
  }) => {
    await page.goto("/items/snippets");
    await openItem(page, SHORT_SNIPPET);
    await expectCodeEditorReady(drawer(page));

    await codeEditor(drawer(page)).locator(".view-lines").click({
      button: "right",
    });

    await expect(page.locator(".monaco-menu")).toHaveCount(0);
  });

  test("is read-only in display mode", async ({ page }) => {
    await page.goto("/items/snippets");
    await openItem(page, SHORT_SNIPPET);
    await expectCodeEditorReady(drawer(page));

    await expect(codeEditorInput(drawer(page))).toHaveJSProperty(
      "readOnly",
      true,
    );
  });
});

test.describe("CodeEditor — height", () => {
  test("caps at 400px for content that overflows it", async ({ page }) => {
    await page.goto("/items/snippets");
    await openItem(page, LONG_SNIPPET);
    await expectCodeEditorReady(drawer(page));

    expect(await codeEditorSurfaceHeight(drawer(page))).toBe(400);
  });

  test("hugs shorter content instead of always filling the cap", async ({
    page,
  }) => {
    await page.goto("/items/snippets");
    await openItem(page, SHORT_SNIPPET);
    await expectCodeEditorReady(drawer(page));

    const height = await codeEditorSurfaceHeight(drawer(page));
    expect(height).toBeLessThan(400);
    expect(height).toBeGreaterThanOrEqual(56);
  });
});

test.describe("CodeEditor — editing", () => {
  let item: SeededTestItem;

  test.beforeEach(async ({}, testInfo) => {
    item = await createTestItem(
      testInfo.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase(),
    );
  });

  test.afterEach(async () => {
    await removeTestItem(item.id);
  });

  test("becomes editable in edit mode", async ({ page }) => {
    await page.goto("/items/snippets");
    await openItem(page, item.title);
    await drawer(page).getByRole("button", { name: "Edit item" }).click();

    await expectCodeEditorReady(drawer(page));
    await expect(codeEditorInput(drawer(page))).toHaveJSProperty(
      "readOnly",
      false,
    );
  });

  /**
   * The point of the whole exercise: indentation and a trailing newline are
   * meaningful in code, and Monaco must not reformat, trim or re-indent what it
   * is handed. Asserted against the stored row rather than the rendered lines,
   * which Monaco virtualizes and rewrites.
   */
  test("stores what was put into it, byte for byte", async ({ page }) => {
    // Braces and quotes: auto-closing would duplicate these if the content went
    // in as keystrokes.
    const content = "function outer() {\n  return {\n    a: 1,\n  };\n}\n";

    await page.goto("/items/snippets");
    await openItem(page, item.title);
    await enterEditMode(page);
    await setCodeEditorValue(drawer(page), content);
    await drawer(page).getByRole("button", { name: "Save" }).click();

    await expect(toast(page)).toHaveText("Item saved");
    expect((await findItemByTitle(item.title))?.content).toBe(content);
  });

  /**
   * The textarea this replaced normalized CRLF to LF for free (the DOM does it);
   * Monaco keeps whatever EOL its model was created with, so without pinning the
   * model to LF a snippet pasted from a Windows source would be stored with
   * `\r\n` throughout.
   */
  test("normalizes CRLF line endings to LF", async ({ page }) => {
    await page.goto("/items/snippets");
    await openItem(page, item.title);
    await enterEditMode(page);
    await setCodeEditorValue(drawer(page), "first\r\nsecond\r\n");
    await drawer(page).getByRole("button", { name: "Save" }).click();

    await expect(toast(page)).toHaveText("Item saved");
    expect((await findItemByTitle(item.title))?.content).toBe("first\nsecond\n");
  });

  test("discards editor changes on cancel", async ({ page }) => {
    const before = (await findItemByTitle(item.title))?.content;

    await page.goto("/items/snippets");
    await openItem(page, item.title);
    await enterEditMode(page);
    await setCodeEditorValue(drawer(page), "throw new Error('discarded');\n");
    await drawer(page).getByRole("button", { name: "Cancel" }).click();

    await expect(drawer(page).getByRole("button", { name: "Save" })).toHaveCount(0);
    expect((await findItemByTitle(item.title))?.content).toBe(before);
  });
});

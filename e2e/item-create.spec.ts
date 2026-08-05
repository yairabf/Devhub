import { expect, test, type Page } from "@playwright/test";

import { codeEditor, setCodeEditorValue } from "./helpers/code-editor";
import { markdownEditor } from "./helpers/markdown-editor";
import { findItemByTitle, removeItemsByTitle } from "./helpers/items";

/**
 * Covers the New Item dialog: the type selector, the per-type field gating, and
 * what actually reaches the database. Items are created through the UI, so they
 * get cuid ids and are cleaned up by title.
 */

const dialog = (page: Page) => page.locator('[data-slot="dialog-content"]');
const toast = (page: Page) => page.locator("[data-sonner-toast]");
// Not `label[for]`: the code editor's row has no labelable control to point at,
// so FormField renders a span there instead.
const fieldLabels = (page: Page) =>
  dialog(page).locator('form [data-slot="field-label"]');
const submit = (page: Page) =>
  dialog(page).getByRole("button", { name: "Create item" });

let title: string;

test.beforeEach(async ({}, testInfo) => {
  title = `E2E create — ${testInfo.title}`;
  await removeItemsByTitle(title);
});

test.afterEach(async () => {
  await removeItemsByTitle(title);
});

async function openDialog(page: Page) {
  await page.getByRole("button", { name: "New Item" }).click();
  await expect(dialog(page)).toBeVisible();
}

test.describe("NewItemDialog — type selector", () => {
  test("opens from the top bar with snippet selected and types in spec order", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await openDialog(page);

    await expect(dialog(page).getByRole("heading")).toHaveText("New item");
    // The DB returns types alphabetically; the selector must not.
    await expect(dialog(page).locator("fieldset label")).toHaveText([
      "Snippet",
      "Prompt",
      "Command",
      "Note",
      "Link",
    ]);
    await expect(
      dialog(page).locator('input[name="itemType"]:checked'),
    ).toHaveValue("type_snippet");
  });

  test("offers no Pro upload types", async ({ page }) => {
    await page.goto("/dashboard");
    await openDialog(page);

    const values = await dialog(page)
      .locator('input[name="itemType"]')
      .evaluateAll(inputs => inputs.map(i => (i as HTMLInputElement).value));

    expect(values).not.toContain("type_file");
    expect(values).not.toContain("type_image");
  });

  test("shows the fields each type needs and hides the rest", async ({ page }) => {
    await page.goto("/dashboard");
    await openDialog(page);

    // Sentence case: the uppercase look is a CSS transform, and toHaveText
    // reads the untransformed text content.
    await expect(fieldLabels(page)).toHaveText([
      "Title",
      "Description",
      "Content",
      "Language",
      "Tags",
    ]);

    await dialog(page).getByText("Note", { exact: true }).click();
    await expect(fieldLabels(page)).toHaveText([
      "Title",
      "Description",
      "Content",
      "Tags",
    ]);

    await dialog(page).getByText("Link", { exact: true }).click();
    await expect(fieldLabels(page)).toHaveText([
      "Title",
      "Description",
      "URL",
      "Tags",
    ]);
  });

  /**
   * A type with a body gets one of the two editors and never a plain textarea, so
   * `#new-item-content` should exist for no type at all. The editor-swap itself is
   * covered in `markdown-editor.spec.ts`.
   */
  test("uses the code editor for code types and the Markdown editor for prose", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await openDialog(page);

    // Snippet is the default selection.
    await expect(codeEditor(dialog(page))).toBeVisible();
    await expect(page.locator("#new-item-content")).toHaveCount(0);

    await dialog(page).getByText("Command", { exact: true }).click();
    await expect(codeEditor(dialog(page))).toBeVisible();

    await dialog(page).getByText("Prompt", { exact: true }).click();
    await expect(codeEditor(dialog(page))).toHaveCount(0);
    await expect(markdownEditor(dialog(page))).toBeVisible();
    await expect(page.locator("#new-item-content")).toHaveCount(0);

    await dialog(page).getByText("Note", { exact: true }).click();
    await expect(codeEditor(dialog(page))).toHaveCount(0);
    await expect(markdownEditor(dialog(page))).toBeVisible();
    await expect(page.locator("#new-item-content")).toHaveCount(0);
  });
});

test.describe("NewItemDialog — creating", () => {
  test("stores a snippet verbatim, then toasts, closes and refreshes the list", async ({
    page,
  }) => {
    await page.goto("/items/snippets");
    await openDialog(page);

    // Leading indentation and the trailing newline must survive — now through
    // Monaco rather than a textarea.
    const content = "  const indented = 1;\n\n  return indented;\n";
    await page.fill("#new-item-title", title);
    await page.fill("#new-item-description", "Created through the dialog");
    await setCodeEditorValue(dialog(page), content);
    await page.fill("#new-item-language", "typescript");
    await page.fill("#new-item-tags", " created , e2e , created ");
    await submit(page).click();

    await expect(toast(page)).toHaveText("Item created");
    await expect(dialog(page)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: `Open ${title}` }),
    ).toBeVisible();

    const stored = await findItemByTitle(title);
    expect(stored).toMatchObject({
      title,
      // Required by the schema with no default.
      contentType: "text",
      content,
      description: "Created through the dialog",
      language: "typescript",
      url: null,
      itemTypeId: "type_snippet",
      userId: "user_demo",
    });
    // Tags trimmed and de-duplicated.
    expect(stored?.tags.map(tag => tag.name)).toEqual(["created", "e2e"]);
  });

  test("creates a link and keeps no content or language", async ({ page }) => {
    await page.goto("/dashboard");
    await openDialog(page);

    await dialog(page).getByText("Link", { exact: true }).click();
    await page.fill("#new-item-title", title);
    await page.fill("#new-item-url", "https://lucide.dev/");
    await submit(page).click();

    await expect(toast(page)).toHaveText("Item created");

    const stored = await findItemByTitle(title);
    expect(stored).toMatchObject({
      itemTypeId: "type_link",
      url: "https://lucide.dev/",
      content: null,
      language: null,
    });
  });

  test("keeps the dialog open and stores nothing when a link has no URL", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await openDialog(page);

    await dialog(page).getByText("Link", { exact: true }).click();
    await page.fill("#new-item-title", title);
    await submit(page).click();

    await expect(toast(page)).toHaveText("URL is required for links");
    await expect(dialog(page)).toBeVisible();
    expect(await findItemByTitle(title)).toBeNull();
  });

  test("rejects a malformed URL", async ({ page }) => {
    await page.goto("/dashboard");
    await openDialog(page);

    await dialog(page).getByText("Link", { exact: true }).click();
    await page.fill("#new-item-title", title);
    await page.fill("#new-item-url", "not a url");
    await submit(page).click();

    await expect(toast(page)).toHaveText("Enter a valid URL");
    expect(await findItemByTitle(title)).toBeNull();
  });

  // A fresh form opening already outlined in red reads as "you did something
  // wrong" before the user has typed a character.
  test("does not mark the empty title invalid until it has been visited", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await openDialog(page);

    const titleInput = page.locator("#new-item-title");
    await expect(titleInput).toHaveAttribute("aria-invalid", "false");

    await titleInput.click();
    await titleInput.blur();
    await expect(titleInput).toHaveAttribute("aria-invalid", "true");

    await titleInput.fill(title);
    await expect(titleInput).toHaveAttribute("aria-invalid", "false");
  });

  test("cannot submit without a title", async ({ page }) => {
    await page.goto("/dashboard");
    await openDialog(page);

    await expect(submit(page)).toBeDisabled();

    await page.fill("#new-item-title", "   ");
    await expect(submit(page)).toBeDisabled();

    await page.fill("#new-item-title", title);
    await expect(submit(page)).toBeEnabled();
  });

  /**
   * The dialog refuses to close mid-request so a create cannot be orphaned.
   * Both dismissals must therefore *look* unavailable — an enabled X that
   * silently does nothing is worse than a disabled one.
   */
  test("disables both ways out while the create is in flight", async ({ page }) => {
    await page.goto("/dashboard");
    await openDialog(page);
    await page.fill("#new-item-title", title);

    // Hold the server action open so the pending state is observable.
    await page.route("**/dashboard", async route => {
      if (route.request().method() !== "POST") return route.continue();
      await new Promise(resolve => setTimeout(resolve, 2000));
      return route.continue();
    });

    await submit(page).click();

    // Located by type, not name: the label becomes "Creating…" while pending.
    const submitButton = dialog(page).locator('button[type="submit"]');
    await expect(submitButton).toHaveText("Creating…");
    await expect(submitButton).toBeDisabled();
    await expect(dialog(page).getByRole("button", { name: "Cancel" })).toBeDisabled();
    await expect(
      dialog(page).getByRole("button", { name: "Close" }),
    ).toBeDisabled();
    await expect(dialog(page)).toBeVisible();

    await expect(toast(page)).toHaveText("Item created", { timeout: 15000 });
  });

  test("discards the draft when cancelled", async ({ page }) => {
    await page.goto("/dashboard");
    await openDialog(page);

    await dialog(page).getByText("Link", { exact: true }).click();
    await page.fill("#new-item-title", title);
    await dialog(page).getByRole("button", { name: "Cancel" }).click();
    await expect(dialog(page)).toHaveCount(0);

    await openDialog(page);
    await expect(page.locator("#new-item-title")).toHaveValue("");
    // Type resets too, so the snippet fields are back.
    await expect(
      dialog(page).locator('input[name="itemType"]:checked'),
    ).toHaveValue("type_snippet");
    expect(await findItemByTitle(title)).toBeNull();
  });
});

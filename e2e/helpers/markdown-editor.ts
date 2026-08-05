import { expect, type Locator } from "@playwright/test";

/** The whole Markdown editor — chrome plus the active pane — inside `scope`. */
export function markdownEditor(scope: Locator): Locator {
  return scope.locator("[data-markdown-editor]");
}

/**
 * The Write pane. A plain textarea, unlike the code editor's Monaco widget, so
 * `fill` reaches it directly and no edit-API detour is needed.
 */
export function markdownInput(scope: Locator): Locator {
  return markdownEditor(scope).locator("textarea");
}

/** The rendered Preview pane. Absent while Write is the active tab. */
export function markdownPreview(scope: Locator): Locator {
  return markdownEditor(scope).locator(".markdown-preview");
}

export function markdownTab(scope: Locator, name: "Write" | "Preview"): Locator {
  return markdownEditor(scope).getByRole("tab", { name });
}

/** Switches tabs and waits for the pane behind it to actually be on screen. */
export async function showMarkdownTab(
  scope: Locator,
  name: "Write" | "Preview",
): Promise<void> {
  await markdownTab(scope, name).click();
  await expect(
    name === "Write" ? markdownInput(scope) : markdownPreview(scope),
  ).toBeVisible();
}

/** Height of the active pane, which is what the 400px cap applies to. */
export async function markdownPaneHeight(pane: Locator): Promise<number> {
  const box = await pane.boundingBox();
  if (!box) throw new Error("The Markdown pane has no bounding box");
  return box.height;
}

import { expect, type Locator } from "@playwright/test";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

/** The whole editor — chrome plus surface — inside `scope`. */
export function codeEditor(scope: Locator): Locator {
  return scope.locator("[data-code-editor]");
}

/**
 * Monaco's hidden textarea. It is the only real form control in the widget, so
 * it is where focus, `readonly` and the accessible name live.
 */
export function codeEditorInput(scope: Locator): Locator {
  return codeEditor(scope).locator("textarea");
}

/** Monaco arrives in a lazily-imported chunk, so specs must wait for it. */
export async function expectCodeEditorReady(scope: Locator): Promise<void> {
  await expect(codeEditor(scope).locator(".monaco-editor")).toBeVisible();
}

/** Height of the editing surface, which is what the 400px cap applies to. */
export async function codeEditorSurfaceHeight(scope: Locator): Promise<number> {
  const box = await codeEditor(scope).locator(".monaco-editor").boundingBox();
  if (!box) throw new Error("The code editor surface has no bounding box");
  return box.height;
}

/**
 * Replaces the editor's contents through Monaco's own edit API.
 *
 * Input events are not a workable route here. `fill` never reaches the model;
 * typing triggers auto-indent and auto-closing brackets, which mangles anything
 * with structure; and a synthetic `paste` event proved flaky — Monaco gates both
 * keybinding dispatch and paste routing on its *own* focus bookkeeping, which
 * Playwright's `toBeFocused()` (a DOM-level assertion) does not speak for, so
 * select-all and the paste were intermittently dropped with no error.
 *
 * `executeEdits` is where a real paste ends up anyway, minus the focus and
 * clipboard machinery. Deliberately not `setValue`: that rebuilds the text
 * buffer and re-detects the EOL from the incoming string, which would quietly
 * turn the CRLF spec into the opposite assertion.
 */
export async function setCodeEditorValue(
  scope: Locator,
  value: string,
): Promise<void> {
  await expectCodeEditorReady(scope);
  // Entering edit mode swaps one editor for another. Waiting for an editable
  // surface keeps the edit off the outgoing read-only editor's model, which is
  // still on screen for a beat.
  await expect(codeEditorInput(scope)).toHaveJSProperty("readOnly", false);

  await codeEditor(scope).evaluate((container, text) => {
    // CodeEditorSurface sets `window.monaco`, matching what Monaco's own AMD
    // loader does for a CDN-loaded copy.
    const api = (window as unknown as { monaco: typeof Monaco }).monaco;
    // Located by containment rather than index: a spec may have more than one
    // editor on the page.
    const editor = api.editor
      .getEditors()
      .find(candidate => container.contains(candidate.getContainerDomNode()));
    if (!editor) throw new Error("No Monaco editor inside this container");

    const model = editor.getModel();
    if (!model) throw new Error("The Monaco editor has no model");

    editor.executeEdits("e2e", [
      { range: model.getFullModelRange(), text, forceMoveMarkers: true },
    ]);
  }, value);
}

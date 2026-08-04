import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

import { auth } from "@/auth";
import {
  deleteItem as deleteItemInDb,
  updateItem as updateItemInDb,
} from "@/lib/db/items";
import { deleteItem, updateItem } from "@/actions/items";

const authMock = auth as unknown as Mock;
const dbUpdate = updateItemInDb as unknown as Mock;
const dbDelete = deleteItemInDb as unknown as Mock;

const VALID = {
  title: "useDebounce",
  description: "A debounce hook",
  content: "const x = 1;",
  language: "typescript",
  url: "",
  tags: ["react", "hooks"],
};

const SAVED = { id: "item_1", title: "useDebounce" };

beforeEach(() => {
  authMock.mockReset();
  dbUpdate.mockReset();
  dbDelete.mockReset();
  authMock.mockResolvedValue({ user: { id: "user_demo" } });
  dbUpdate.mockResolvedValue(SAVED);
  dbDelete.mockResolvedValue(true);
});

describe("updateItem action", () => {
  it("saves as the session user and returns the refreshed item", async () => {
    const result = await updateItem("item_1", VALID);

    expect(result).toEqual({ success: true, data: SAVED });
    expect(dbUpdate.mock.calls[0][0]).toBe("user_demo");
    expect(dbUpdate.mock.calls[0][1]).toBe("item_1");
  });

  it("rejects an unauthenticated caller without touching the database", async () => {
    authMock.mockResolvedValue(null);

    const result = await updateItem("item_1", VALID);

    expect(result).toEqual({
      success: false,
      error: "You must be signed in to edit items.",
    });
    expect(dbUpdate).not.toHaveBeenCalled();
  });

  it("rejects a session with no user id", async () => {
    authMock.mockResolvedValue({ user: { email: "demo@devstash.io" } });

    const result = await updateItem("item_1", VALID);

    expect(result).toMatchObject({ success: false });
    expect(dbUpdate).not.toHaveBeenCalled();
  });

  it("rejects an empty or whitespace-only title", async () => {
    await expect(updateItem("item_1", { ...VALID, title: "   " })).resolves.toEqual({
      success: false,
      error: "Title is required",
    });
    expect(dbUpdate).not.toHaveBeenCalled();
  });

  it("rejects a malformed URL", async () => {
    const result = await updateItem("item_1", { ...VALID, url: "not a url" });

    expect(result).toEqual({ success: false, error: "Enter a valid URL" });
    expect(dbUpdate).not.toHaveBeenCalled();
  });

  it("accepts a well-formed URL", async () => {
    await updateItem("item_1", { ...VALID, url: "https://lucide.dev/" });

    expect(dbUpdate.mock.calls[0][2]).toMatchObject({
      url: "https://lucide.dev/",
    });
  });

  it("trims the title and turns blank optional fields into null", async () => {
    await updateItem("item_1", {
      ...VALID,
      title: "  Spaced out  ",
      description: "   ",
      content: "",
      language: "  ",
      url: "",
    });

    expect(dbUpdate.mock.calls[0][2]).toMatchObject({
      title: "Spaced out",
      description: null,
      content: null,
      language: null,
      url: null,
    });
  });

  it("preserves whitespace inside content — code indentation is significant", async () => {
    const code = "  const indented = 1;\n\n  return indented;\n";

    await updateItem("item_1", { ...VALID, content: code });

    expect(dbUpdate.mock.calls[0][2]).toMatchObject({ content: code });
  });

  it("treats a whitespace-only content as cleared", async () => {
    await updateItem("item_1", { ...VALID, content: "  \n  " });

    expect(dbUpdate.mock.calls[0][2]).toMatchObject({ content: null });
  });

  it("trims, drops empties and de-duplicates tags", async () => {
    await updateItem("item_1", {
      ...VALID,
      tags: [" react ", "", "hooks", "react", "   "],
    });

    expect(dbUpdate.mock.calls[0][2]).toMatchObject({
      tags: ["react", "hooks"],
    });
  });

  // What the form actually sends for a link: the hidden content/language fields
  // arrive as the stored nulls rather than empty strings.
  it("passes explicit nulls straight through", async () => {
    await updateItem("item_1", {
      title: "Lucide Icons",
      description: null,
      content: null,
      language: null,
      url: "https://lucide.dev/",
      tags: [],
    });

    expect(dbUpdate.mock.calls[0][2]).toEqual({
      title: "Lucide Icons",
      description: null,
      content: null,
      language: null,
      url: "https://lucide.dev/",
      tags: [],
    });
  });

  it("defaults omitted optional fields to null and tags to an empty array", async () => {
    await updateItem("item_1", { title: "Only a title" });

    expect(dbUpdate.mock.calls[0][2]).toEqual({
      title: "Only a title",
      description: null,
      content: null,
      language: null,
      url: null,
      tags: [],
    });
  });

  it("reports a missing or foreign item as not found", async () => {
    dbUpdate.mockResolvedValue(null);

    const result = await updateItem("item_1", VALID);

    expect(result).toEqual({ success: false, error: "Item not found." });
  });

  it("surfaces an unexpected database failure as a friendly error", async () => {
    dbUpdate.mockRejectedValue(new Error("connection reset"));

    const result = await updateItem("item_1", VALID);

    expect(result).toEqual({
      success: false,
      error: "Could not save this item. Please try again.",
    });
  });
});

describe("deleteItem action", () => {
  it("deletes as the session user", async () => {
    const result = await deleteItem("item_1");

    expect(result).toEqual({ success: true });
    expect(dbDelete).toHaveBeenCalledTimes(1);
    expect(dbDelete.mock.calls[0][0]).toBe("user_demo");
    expect(dbDelete.mock.calls[0][1]).toBe("item_1");
  });

  it("rejects an unauthenticated caller without touching the database", async () => {
    authMock.mockResolvedValue(null);

    const result = await deleteItem("item_1");

    expect(result).toEqual({
      success: false,
      error: "You must be signed in to delete items.",
    });
    expect(dbDelete).not.toHaveBeenCalled();
  });

  it("rejects a session with no user id", async () => {
    authMock.mockResolvedValue({ user: { email: "demo@devstash.io" } });

    const result = await deleteItem("item_1");

    expect(result).toMatchObject({ success: false });
    expect(dbDelete).not.toHaveBeenCalled();
  });

  it("reports a missing or foreign item as not found", async () => {
    dbDelete.mockResolvedValue(false);

    const result = await deleteItem("item_1");

    expect(result).toEqual({ success: false, error: "Item not found." });
  });

  it("rejects a blank id without spending a query on it", async () => {
    for (const blank of ["", "   "]) {
      await expect(deleteItem(blank)).resolves.toEqual({
        success: false,
        error: "Item not found.",
      });
    }
    expect(dbDelete).not.toHaveBeenCalled();
  });

  it("surfaces an unexpected database failure as a friendly error", async () => {
    dbDelete.mockRejectedValue(new Error("connection reset"));

    const result = await deleteItem("item_1");

    expect(result).toEqual({
      success: false,
      error: "Could not delete this item. Please try again.",
    });
  });
});

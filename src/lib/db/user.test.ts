import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  getEditorPreferences,
  isUserPro,
  updateEditorPreferences,
} from "@/lib/db/user";
import { DEFAULT_EDITOR_PREFERENCES } from "@/types/editor-preferences";

const findUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const update = prisma.user.update as ReturnType<typeof vi.fn>;

const SAVED = {
  fontSize: 16,
  tabSize: 4,
  wordWrap: false,
  minimap: true,
  theme: "monokai" as const,
};

beforeEach(() => {
  findUnique.mockReset();
  update.mockReset();
});

describe("getEditorPreferences", () => {
  it("returns the stored preferences", async () => {
    findUnique.mockResolvedValue({ editorPreferences: SAVED });

    const result = await getEditorPreferences("user_1");

    expect(result).toEqual(SAVED);
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "user_1" },
      select: { editorPreferences: true },
    });
  });

  it("returns defaults when the user has never saved preferences", async () => {
    findUnique.mockResolvedValue({ editorPreferences: null });

    const result = await getEditorPreferences("user_1");

    expect(result).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("returns defaults when the user does not exist", async () => {
    findUnique.mockResolvedValue(null);

    const result = await getEditorPreferences("user_1");

    expect(result).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });
});

describe("updateEditorPreferences", () => {
  it("writes the preferences and returns the refreshed value", async () => {
    update.mockResolvedValue({ editorPreferences: SAVED });

    const result = await updateEditorPreferences("user_1", SAVED);

    expect(result).toEqual(SAVED);
    expect(update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { editorPreferences: SAVED },
      select: { editorPreferences: true },
    });
  });
});

describe("isUserPro", () => {
  it("reports a Pro user", async () => {
    findUnique.mockResolvedValue({ isPro: true });

    await expect(isUserPro("user_1")).resolves.toBe(true);
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "user_1" },
      select: { isPro: true },
    });
  });

  it("reports a free user", async () => {
    findUnique.mockResolvedValue({ isPro: false });

    await expect(isUserPro("user_1")).resolves.toBe(false);
  });

  it("defaults to free when the user row is missing", async () => {
    findUnique.mockResolvedValue(null);

    await expect(isUserPro("ghost")).resolves.toBe(false);
  });
});

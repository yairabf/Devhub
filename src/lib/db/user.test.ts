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
import { getEditorPreferences, updateEditorPreferences } from "@/lib/db/user";
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

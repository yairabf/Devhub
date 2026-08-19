import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/user", () => ({ updateEditorPreferences: vi.fn() }));

import { auth } from "@/auth";
import { updateEditorPreferences as updateEditorPreferencesInDb } from "@/lib/db/user";
import { updateEditorPreferences } from "@/actions/editor-preferences";

const authMock = auth as unknown as Mock;
const dbUpdate = updateEditorPreferencesInDb as unknown as Mock;

const VALID = {
  fontSize: 16 as const,
  tabSize: 4 as const,
  wordWrap: false,
  minimap: true,
  theme: "monokai" as const,
};

beforeEach(() => {
  authMock.mockReset();
  dbUpdate.mockReset();
  authMock.mockResolvedValue({ user: { id: "user_demo" } });
  dbUpdate.mockResolvedValue(VALID);
});

describe("updateEditorPreferences action", () => {
  it("saves for the session user and returns the updated preferences", async () => {
    const result = await updateEditorPreferences(VALID);

    expect(result).toEqual({ success: true, data: VALID });
    expect(dbUpdate).toHaveBeenCalledWith("user_demo", VALID);
  });

  it("rejects when there is no session", async () => {
    authMock.mockResolvedValue(null);

    const result = await updateEditorPreferences(VALID);

    expect(result.success).toBe(false);
    expect(dbUpdate).not.toHaveBeenCalled();
  });

  it("rejects an invalid payload without touching the db", async () => {
    const result = await updateEditorPreferences({
      ...VALID,
      fontSize: 999 as unknown as typeof VALID.fontSize,
    });

    expect(result.success).toBe(false);
    expect(dbUpdate).not.toHaveBeenCalled();
  });

  it("returns a friendly error when the db call throws", async () => {
    dbUpdate.mockRejectedValue(new Error("db down"));

    const result = await updateEditorPreferences(VALID);

    expect(result.success).toBe(false);
  });
});

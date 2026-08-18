import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
}));

import { auth } from "@/auth";
import { createCollection as createCollectionInDb } from "@/lib/db/collections";
import { createCollection } from "@/actions/collections";

const authMock = auth as unknown as Mock;
const dbCreate = createCollectionInDb as unknown as Mock;

const SAVED = {
  id: "col_1",
  name: "React Patterns",
  description: "Reusable patterns",
  isFavorite: false,
  itemCount: 0,
  uniqueTypeIds: [],
  dominantTypeId: null,
};

beforeEach(() => {
  authMock.mockReset();
  dbCreate.mockReset();
  authMock.mockResolvedValue({ user: { id: "user_demo" } });
  dbCreate.mockResolvedValue(SAVED);
});

describe("createCollection action", () => {
  it("saves as the session user and returns the created collection", async () => {
    const result = await createCollection({ name: "React Patterns", description: "Reusable patterns" });

    expect(result).toEqual({ success: true, data: SAVED });
    expect(dbCreate).toHaveBeenCalledWith("user_demo", {
      name: "React Patterns",
      description: "Reusable patterns",
    });
  });

  it("normalizes an empty description to null", async () => {
    await createCollection({ name: "React Patterns", description: "" });

    expect(dbCreate).toHaveBeenCalledWith("user_demo", {
      name: "React Patterns",
      description: null,
    });
  });

  it("rejects an unauthenticated caller without touching the database", async () => {
    authMock.mockResolvedValue(null);

    const result = await createCollection({ name: "React Patterns", description: "" });

    expect(result).toEqual({
      success: false,
      error: "You must be signed in to create collections.",
    });
    expect(dbCreate).not.toHaveBeenCalled();
  });

  it("rejects a session with no user id", async () => {
    authMock.mockResolvedValue({ user: { email: "demo@devstash.io" } });

    const result = await createCollection({ name: "React Patterns", description: "" });

    expect(result).toMatchObject({ success: false });
    expect(dbCreate).not.toHaveBeenCalled();
  });

  it("rejects an empty or whitespace-only name", async () => {
    const result = await createCollection({ name: "   ", description: "" });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(dbCreate).not.toHaveBeenCalled();
  });

  it("returns a friendly error when the database call throws", async () => {
    dbCreate.mockRejectedValue(new Error("connection refused"));

    const result = await createCollection({ name: "React Patterns", description: "" });

    expect(result).toEqual({
      success: false,
      error: "Could not create this collection. Please try again.",
    });
  });
});

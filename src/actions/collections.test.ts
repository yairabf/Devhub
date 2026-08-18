import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
}));

import { auth } from "@/auth";
import {
  createCollection as createCollectionInDb,
  deleteCollection as deleteCollectionInDb,
  updateCollection as updateCollectionInDb,
} from "@/lib/db/collections";
import {
  createCollection,
  deleteCollection,
  updateCollection,
} from "@/actions/collections";

const authMock = auth as unknown as Mock;
const dbCreate = createCollectionInDb as unknown as Mock;
const dbUpdate = updateCollectionInDb as unknown as Mock;
const dbDelete = deleteCollectionInDb as unknown as Mock;

const SAVED = {
  id: "col_1",
  name: "React Patterns",
  description: "Reusable patterns",
  isFavorite: false,
  itemCount: 0,
  uniqueTypeIds: [],
  dominantTypeId: null,
};

const SAVED_META = {
  id: "col_1",
  name: "React Patterns",
  description: "Reusable patterns",
  isFavorite: false,
};

beforeEach(() => {
  authMock.mockReset();
  dbCreate.mockReset();
  dbUpdate.mockReset();
  dbDelete.mockReset();
  authMock.mockResolvedValue({ user: { id: "user_demo" } });
  dbCreate.mockResolvedValue(SAVED);
  dbUpdate.mockResolvedValue(SAVED_META);
  dbDelete.mockResolvedValue(true);
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

describe("updateCollection action", () => {
  it("saves as the session user and returns the updated metadata", async () => {
    const result = await updateCollection("col_1", {
      name: "React Patterns",
      description: "Reusable patterns",
    });

    expect(result).toEqual({ success: true, data: SAVED_META });
    expect(dbUpdate.mock.calls[0][0]).toBe("user_demo");
    expect(dbUpdate.mock.calls[0][1]).toBe("col_1");
    expect(dbUpdate.mock.calls[0][2]).toEqual({
      name: "React Patterns",
      description: "Reusable patterns",
    });
  });

  it("normalizes an empty description to null", async () => {
    await updateCollection("col_1", { name: "React Patterns", description: "" });

    expect(dbUpdate.mock.calls[0][2]).toMatchObject({ description: null });
  });

  it("rejects an unauthenticated caller without touching the database", async () => {
    authMock.mockResolvedValue(null);

    const result = await updateCollection("col_1", {
      name: "React Patterns",
      description: "",
    });

    expect(result).toEqual({
      success: false,
      error: "You must be signed in to edit collections.",
    });
    expect(dbUpdate).not.toHaveBeenCalled();
  });

  it("rejects a session with no user id", async () => {
    authMock.mockResolvedValue({ user: { email: "demo@devstash.io" } });

    const result = await updateCollection("col_1", {
      name: "React Patterns",
      description: "",
    });

    expect(result).toMatchObject({ success: false });
    expect(dbUpdate).not.toHaveBeenCalled();
  });

  it("rejects an empty or whitespace-only name", async () => {
    const result = await updateCollection("col_1", { name: "   ", description: "" });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(dbUpdate).not.toHaveBeenCalled();
  });

  it("reports a missing or foreign collection as not found", async () => {
    dbUpdate.mockResolvedValue(null);

    const result = await updateCollection("col_1", {
      name: "React Patterns",
      description: "",
    });

    expect(result).toEqual({ success: false, error: "Collection not found." });
  });

  it("returns a friendly error when the database call throws", async () => {
    dbUpdate.mockRejectedValue(new Error("connection refused"));

    const result = await updateCollection("col_1", {
      name: "React Patterns",
      description: "",
    });

    expect(result).toEqual({
      success: false,
      error: "Could not save this collection. Please try again.",
    });
  });
});

describe("deleteCollection action", () => {
  it("deletes as the session user", async () => {
    const result = await deleteCollection("col_1");

    expect(result).toEqual({ success: true });
    expect(dbDelete).toHaveBeenCalledTimes(1);
    expect(dbDelete.mock.calls[0][0]).toBe("user_demo");
    expect(dbDelete.mock.calls[0][1]).toBe("col_1");
  });

  it("rejects an unauthenticated caller without touching the database", async () => {
    authMock.mockResolvedValue(null);

    const result = await deleteCollection("col_1");

    expect(result).toEqual({
      success: false,
      error: "You must be signed in to delete collections.",
    });
    expect(dbDelete).not.toHaveBeenCalled();
  });

  it("rejects a session with no user id", async () => {
    authMock.mockResolvedValue({ user: { email: "demo@devstash.io" } });

    const result = await deleteCollection("col_1");

    expect(result).toMatchObject({ success: false });
    expect(dbDelete).not.toHaveBeenCalled();
  });

  it("reports a missing or foreign collection as not found", async () => {
    dbDelete.mockResolvedValue(false);

    const result = await deleteCollection("col_1");

    expect(result).toEqual({ success: false, error: "Collection not found." });
  });

  it("rejects a blank id without spending a query on it", async () => {
    for (const blank of ["", "   "]) {
      await expect(deleteCollection(blank)).resolves.toEqual({
        success: false,
        error: "Collection not found.",
      });
    }
    expect(dbDelete).not.toHaveBeenCalled();
  });

  it("surfaces an unexpected database failure as a friendly error", async () => {
    dbDelete.mockRejectedValue(new Error("connection reset"));

    const result = await deleteCollection("col_1");

    expect(result).toEqual({
      success: false,
      error: "Could not delete this collection. Please try again.",
    });
  });
});

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ getItemDetail: vi.fn() }));

import { auth } from "@/auth";
import { getItemDetail } from "@/lib/db/items";
import { GET } from "@/app/api/items/[id]/route";

const authMock = auth as unknown as Mock;
const getItemDetailMock = getItemDetail as unknown as Mock;

const ITEM = {
  id: "item_1",
  title: "useDebounce",
  description: "A debounce hook",
  content: "const x = 1;",
  url: null,
  language: "typescript",
  isFavorite: true,
  isPinned: false,
  itemTypeId: "type_snippet",
  itemTypeName: "snippet",
  tags: [{ id: "tag_1", name: "react" }],
  collections: [{ id: "col_1", name: "React Patterns" }],
  createdAt: "2026-04-10T12:30:00.000Z",
  updatedAt: "2026-04-12T08:00:00.000Z",
};

function request(id = "item_1") {
  return new Request(`http://localhost:3000/api/items/${id}`);
}

function params(id = "item_1") {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  authMock.mockReset();
  getItemDetailMock.mockReset();
});

describe("GET /api/items/[id]", () => {
  it("returns the item for the signed-in owner", async () => {
    authMock.mockResolvedValue({ user: { id: "user_demo" } });
    getItemDetailMock.mockResolvedValue(ITEM);

    const response = await GET(request(), params());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      item: ITEM,
    });
  });

  // Deliberately not the seeded demo id, so this still fails if the route ever
  // regresses to a hardcoded user rather than reading the session.
  it("scopes the lookup to the session user, not a hardcoded one", async () => {
    authMock.mockResolvedValue({ user: { id: "user_github_42" } });
    getItemDetailMock.mockResolvedValue(ITEM);

    await GET(request("item_42"), params("item_42"));

    expect(getItemDetailMock).toHaveBeenCalledWith("user_github_42", "item_42");
  });

  it("returns 401 without a session and never touches the database", async () => {
    authMock.mockResolvedValue(null);

    const response = await GET(request(), params());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Unauthorized",
    });
    expect(getItemDetailMock).not.toHaveBeenCalled();
  });

  it("returns 401 when the session carries no user id", async () => {
    authMock.mockResolvedValue({ user: { email: "demo@devstash.io" } });

    const response = await GET(request(), params());

    expect(response.status).toBe(401);
    expect(getItemDetailMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the item is missing or owned by someone else", async () => {
    authMock.mockResolvedValue({ user: { id: "user_other" } });
    getItemDetailMock.mockResolvedValue(null);

    const response = await GET(request(), params());

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Item not found",
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  PAGE_GAP,
  getPageLinks,
  getPagination,
  pageHref,
  parsePageParam,
} from "@/lib/pagination";

describe("parsePageParam", () => {
  it("defaults to page 1 when the param is absent", () => {
    expect(parsePageParam(undefined)).toBe(1);
  });

  it("parses a valid page number", () => {
    expect(parsePageParam("3")).toBe(3);
  });

  it.each([
    ["0", "zero"],
    ["-2", "a negative"],
    ["1.5", "a fraction"],
    ["abc", "non-numeric text"],
    ["", "an empty string"],
    ["Infinity", "infinity"],
    ["NaN", "NaN"],
  ])("falls back to page 1 for %s (%s)", raw => {
    expect(parsePageParam(raw)).toBe(1);
  });

  it("takes the first value when the param is repeated", () => {
    expect(parsePageParam(["2", "5"])).toBe(2);
  });
});

describe("getPagination", () => {
  it("reports a single page when there is nothing to show", () => {
    expect(getPagination(1, 0, 21)).toEqual({
      page: 1,
      pageCount: 1,
      skip: 0,
      take: 21,
      hasPrev: false,
      hasNext: false,
    });
  });

  it("computes the database window for a middle page", () => {
    const result = getPagination(3, 100, 21);
    expect(result.skip).toBe(42);
    expect(result.take).toBe(21);
    expect(result.page).toBe(3);
  });

  it("rounds the page count up for a partial last page", () => {
    expect(getPagination(1, 22, 21).pageCount).toBe(2);
  });

  it("does not round up when the total divides evenly", () => {
    expect(getPagination(1, 42, 21).pageCount).toBe(2);
  });

  it("clamps a page past the end to the last page", () => {
    const result = getPagination(99, 22, 21);
    expect(result.page).toBe(2);
    expect(result.skip).toBe(21);
  });

  it("clamps a page below 1 up to the first page", () => {
    expect(getPagination(0, 100, 21).page).toBe(1);
  });

  it("disables prev on the first page and next on the last", () => {
    expect(getPagination(1, 100, 21)).toMatchObject({
      hasPrev: false,
      hasNext: true,
    });
    expect(getPagination(5, 100, 21)).toMatchObject({
      hasPrev: true,
      hasNext: false,
    });
  });
});

describe("getPageLinks", () => {
  it("lists every page without a gap when they all fit", () => {
    expect(getPageLinks(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("lists every page at exactly the limit", () => {
    expect(getPageLinks(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("elides on the right when the current page is near the start", () => {
    expect(getPageLinks(1, 20)).toEqual([1, 2, 3, 4, PAGE_GAP, 20]);
  });

  it("elides on both sides in the middle", () => {
    expect(getPageLinks(10, 20)).toEqual([1, PAGE_GAP, 9, 10, 11, PAGE_GAP, 20]);
  });

  it("elides on the left when the current page is near the end", () => {
    expect(getPageLinks(20, 20)).toEqual([1, PAGE_GAP, 17, 18, 19, 20]);
  });

  it("shows page 2 rather than a gap that would hide only it", () => {
    expect(getPageLinks(4, 40)).toEqual([1, 2, 3, 4, 5, PAGE_GAP, 40]);
  });

  it("always includes the first and last page", () => {
    for (const page of [1, 2, 7, 13, 19, 20]) {
      const links = getPageLinks(page, 20);
      expect(links[0]).toBe(1);
      expect(links[links.length - 1]).toBe(20);
    }
  });

  it("always includes the current page", () => {
    for (let page = 1; page <= 20; page++) {
      expect(getPageLinks(page, 20)).toContain(page);
    }
  });

  it("never exceeds the link budget", () => {
    for (let page = 1; page <= 40; page++) {
      expect(getPageLinks(page, 40).length).toBeLessThanOrEqual(7);
    }
  });

  it("never emits a gap that hides only one page", () => {
    // A gap standing in for a single number is wasted space — it is the same
    // width as the number it replaces.
    for (let page = 1; page <= 40; page++) {
      const links = getPageLinks(page, 40);
      links.forEach((link, i) => {
        if (link !== PAGE_GAP) return;
        const before = links[i - 1];
        const after = links[i + 1];
        expect(typeof before === "number" && typeof after === "number").toBe(true);
        expect((after as number) - (before as number)).toBeGreaterThan(2);
      });
    }
  });
});

describe("pageHref", () => {
  it("leaves page 1 as the bare path, so the listing has one canonical URL", () => {
    expect(pageHref("/items/snippets", 1)).toBe("/items/snippets");
  });

  it("adds the page query for later pages", () => {
    expect(pageHref("/items/snippets", 4)).toBe("/items/snippets?page=4");
  });
});

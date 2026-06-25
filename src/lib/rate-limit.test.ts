import { describe, it, expect } from "vitest";
import { getClientIp, rateLimitMessage } from "@/lib/rate-limit";

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request("https://example.com", { headers });
}

describe("getClientIp", () => {
  it("uses the first hop of x-forwarded-for", () => {
    const request = requestWithHeaders({
      "x-forwarded-for": "203.0.113.1, 70.41.3.18, 150.172.238.178",
    });
    expect(getClientIp(request)).toBe("203.0.113.1");
  });

  it("trims whitespace around the first hop", () => {
    const request = requestWithHeaders({
      "x-forwarded-for": "  203.0.113.5  , 70.41.3.18",
    });
    expect(getClientIp(request)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const request = requestWithHeaders({ "x-real-ip": "198.51.100.7" });
    expect(getClientIp(request)).toBe("198.51.100.7");
  });

  it("returns 'unknown' when no ip headers are present", () => {
    expect(getClientIp(requestWithHeaders({}))).toBe("unknown");
  });
});

describe("rateLimitMessage", () => {
  it("uses the singular form for one minute", () => {
    expect(rateLimitMessage(60)).toBe(
      "Too many attempts. Please try again in 1 minute.",
    );
  });

  it("rounds up partial minutes and uses the plural form", () => {
    expect(rateLimitMessage(61)).toBe(
      "Too many attempts. Please try again in 2 minutes.",
    );
  });

  it("rounds up sub-minute waits to 1 minute", () => {
    expect(rateLimitMessage(5)).toBe(
      "Too many attempts. Please try again in 1 minute.",
    );
  });
});

import { describe, it, expect } from "vitest";
import { getTypeLeftBorderClass, getTypeDotClass } from "@/lib/type-colors";

describe("getTypeLeftBorderClass", () => {
  it("returns the mapped class for a known type id", () => {
    expect(getTypeLeftBorderClass("type_snippet")).toBe("border-l-blue-500");
    expect(getTypeLeftBorderClass("type_image")).toBe("border-l-pink-500");
  });

  it("falls back to the border class for an unknown type id", () => {
    expect(getTypeLeftBorderClass("type_unknown")).toBe("border-l-border");
  });

  it("falls back to the border class for null", () => {
    expect(getTypeLeftBorderClass(null)).toBe("border-l-border");
  });
});

describe("getTypeDotClass", () => {
  it("returns the mapped class for a known type id", () => {
    expect(getTypeDotClass("type_command")).toBe("bg-orange-500");
    expect(getTypeDotClass("type_note")).toBe("bg-yellow-400");
  });

  it("falls back to the muted class for an unknown type id", () => {
    expect(getTypeDotClass("type_unknown")).toBe("bg-muted-foreground");
  });

  it("falls back to the muted class for null", () => {
    expect(getTypeDotClass(null)).toBe("bg-muted-foreground");
  });
});

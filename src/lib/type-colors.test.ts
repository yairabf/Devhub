import { describe, it, expect } from "vitest";
import {
  getTypeLeftBorderClass,
  getTypeDotClass,
  getTypeTextClass,
  getTypeBadgeClass,
} from "@/lib/type-colors";

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

describe("getTypeTextClass", () => {
  it("returns the mapped class for a known type id", () => {
    expect(getTypeTextClass("type_snippet")).toBe("text-blue-500");
    expect(getTypeTextClass("type_prompt")).toBe("text-purple-500");
  });

  it("falls back to the muted class for an unknown type id", () => {
    expect(getTypeTextClass("type_unknown")).toBe("text-muted-foreground");
  });

  it("falls back to the muted class for null", () => {
    expect(getTypeTextClass(null)).toBe("text-muted-foreground");
  });
});

describe("getTypeBadgeClass", () => {
  it("returns the mapped border+text classes for a known type id", () => {
    expect(getTypeBadgeClass("type_snippet")).toBe(
      "border-blue-500/40 text-blue-500"
    );
    expect(getTypeBadgeClass("type_command")).toBe(
      "border-orange-500/40 text-orange-500"
    );
  });

  it("falls back to the default border/text classes for an unknown type id", () => {
    expect(getTypeBadgeClass("type_unknown")).toBe(
      "border-border text-foreground"
    );
  });

  it("falls back to the default border/text classes for null", () => {
    expect(getTypeBadgeClass(null)).toBe("border-border text-foreground");
  });
});

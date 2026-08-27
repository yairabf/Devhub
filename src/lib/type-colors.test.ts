import { describe, it, expect } from "vitest";
import {
  getTypeLeftBorderClass,
  getTypeDotClass,
  getTypeTextClass,
  getTypeBadgeClass,
  getTypeTopBorderClass,
  getTypeSoftBgClass,
} from "@/lib/type-colors";

describe("getTypeLeftBorderClass", () => {
  it("returns the mapped class for a known type id", () => {
    expect(getTypeLeftBorderClass("type_snippet")).toBe(
      "border-l-blue-600 dark:border-l-blue-500"
    );
    expect(getTypeLeftBorderClass("type_image")).toBe(
      "border-l-pink-600 dark:border-l-pink-500"
    );
    expect(getTypeLeftBorderClass("type_file")).toBe("border-l-gray-500");
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
    expect(getTypeDotClass("type_command")).toBe(
      "bg-orange-700 dark:bg-orange-500"
    );
    expect(getTypeDotClass("type_note")).toBe(
      "bg-yellow-700 dark:bg-yellow-400"
    );
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
    expect(getTypeTextClass("type_snippet")).toBe(
      "text-blue-600 dark:text-blue-500"
    );
    expect(getTypeTextClass("type_prompt")).toBe(
      "text-purple-600 dark:text-purple-500"
    );
    expect(getTypeTextClass("type_file")).toBe("text-gray-500");
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
      "border-blue-600/40 text-blue-600 dark:border-blue-500/40 dark:text-blue-500"
    );
    expect(getTypeBadgeClass("type_command")).toBe(
      "border-orange-700/40 text-orange-700 dark:border-orange-500/40 dark:text-orange-500"
    );
    expect(getTypeBadgeClass("type_file")).toBe(
      "border-gray-500/40 text-gray-500"
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

describe("getTypeTopBorderClass", () => {
  it("returns the mapped class for a known type id", () => {
    expect(getTypeTopBorderClass("type_snippet")).toBe(
      "border-t-blue-600 dark:border-t-blue-500"
    );
    expect(getTypeTopBorderClass("type_file")).toBe("border-t-gray-500");
  });

  it("falls back to the border class for an unknown type id", () => {
    expect(getTypeTopBorderClass("type_unknown")).toBe("border-t-border");
  });

  it("falls back to the border class for null", () => {
    expect(getTypeTopBorderClass(null)).toBe("border-t-border");
  });
});

describe("getTypeSoftBgClass", () => {
  it("returns the mapped class for a known type id", () => {
    expect(getTypeSoftBgClass("type_prompt")).toBe("bg-purple-500/10");
    expect(getTypeSoftBgClass("type_link")).toBe("bg-emerald-500/10");
  });

  it("falls back to the muted class for an unknown type id", () => {
    expect(getTypeSoftBgClass("type_unknown")).toBe("bg-muted");
  });

  it("falls back to the muted class for null", () => {
    expect(getTypeSoftBgClass(null)).toBe("bg-muted");
  });
});

import { describe, it, expect } from "vitest";

import { getTypeName } from "@/lib/type-icons";

describe("getTypeName", () => {
  it("maps every system type id to a display name", () => {
    expect(getTypeName("type_snippet")).toBe("Snippet");
    expect(getTypeName("type_prompt")).toBe("Prompt");
    expect(getTypeName("type_command")).toBe("Command");
    expect(getTypeName("type_note")).toBe("Note");
    expect(getTypeName("type_link")).toBe("Link");
    expect(getTypeName("type_file")).toBe("File");
    expect(getTypeName("type_image")).toBe("Image");
  });

  it("never leaks a raw database id for an unknown type", () => {
    expect(getTypeName("type_something_new")).toBe("Item");
    expect(getTypeName("")).toBe("Item");
  });
});

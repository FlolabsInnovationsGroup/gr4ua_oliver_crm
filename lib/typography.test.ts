import { describe, expect, it } from "vitest";
import { noWidow } from "./typography";

describe("noWidow", () => {
  it("joins the last two words with a non-breaking space", () => {
    expect(noWidow("Explore our projects today")).toBe(
      "Explore our projects\u00A0today"
    );
  });

  it("returns short strings unchanged", () => {
    expect(noWidow("Hello")).toBe("Hello");
    expect(noWidow("Hello world")).toBe("Hello world");
  });
});

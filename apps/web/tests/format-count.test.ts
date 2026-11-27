import { describe, expect, test } from "vitest";
import { formatCount } from "@/lib/github";

describe("formatCount", () => {
  test("keeps small counts whole and shortens the rest to one decimal", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(1234)).toBe("1.2k");
    expect(formatCount(1999)).toBe("2k");
    expect(formatCount(12_345)).toBe("12.3k");
    expect(formatCount(1_000_000)).toBe("1m");
    expect(formatCount(1_250_000)).toBe("1.3m");
  });
});

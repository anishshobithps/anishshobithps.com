import { describe, expect, it } from "vitest";
import { hasSessionHint } from "@/lib/session-hint";

describe("hasSessionHint", () => {
  it("is false when no cookies are set", () => {
    expect(hasSessionHint("")).toBe(false);
  });

  it("is false for a signed-out client cookie", () => {
    expect(hasSessionHint("__client_uat=0")).toBe(false);
    expect(hasSessionHint("a=1; __client_uat=0; b=2")).toBe(false);
  });

  it("is true for a signed-in client cookie", () => {
    expect(hasSessionHint("__client_uat=1700000000")).toBe(true);
    expect(hasSessionHint("a=1; __client_uat=1700000000; b=2")).toBe(true);
  });

  it("handles suffixed cookie names", () => {
    expect(hasSessionHint("__client_uat_abc123=1700000000")).toBe(true);
    expect(hasSessionHint("__client_uat_abc123=0")).toBe(false);
  });

  it("ignores unrelated cookies", () => {
    expect(hasSessionHint("__session=abc; theme=dark")).toBe(false);
    expect(hasSessionHint("x__client_uat=1700000000")).toBe(false);
  });
});

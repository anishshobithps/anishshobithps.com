import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { HalftoneMeter } from "@/components/layouts/blog-toc";

describe("HalftoneMeter", () => {
  test("reports reading progress as a meter", () => {
    const { rerender } = render(<HalftoneMeter progress={0.42} />);
    const meter = screen.getByRole("meter", { name: "Reading progress" });
    expect(meter.getAttribute("aria-valuenow")).toBe("0.42");
    expect(meter.getAttribute("aria-valuetext")).toBe("42%");

    rerender(<HalftoneMeter progress={1} />);
    expect(meter.getAttribute("aria-valuetext")).toBe("100%");
  });
});

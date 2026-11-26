import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, test } from "vitest";
import { BlogBody } from "@/components/layouts/blog";
import { setTocOpen } from "@/lib/reading-store";

beforeAll(() => {
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  } as unknown as typeof IntersectionObserver;
});

const toc = [
  { title: "Where it started", url: "#start", depth: 2 },
  { title: "How it works", url: "#works", depth: 2 },
];

function renderBody() {
  render(
    <BlogBody
      toc={toc}
      rail={<a href="https://unicode.org">Unicode TR51</a>}
      railCount={1}
    >
      <h2 id="start">Where it started</h2>
      <h2 id="works">How it works</h2>
    </BlogBody>,
  );
  act(() => setTocOpen(true));
  return screen.getByRole("tablist", { name: "Post navigation" });
}

describe("Blog drawer tabs", () => {
  test("Contents is selected first and Links shows the rail", async () => {
    const user = userEvent.setup();
    const list = renderBody();
    const [contents, links] = within(list).getAllByRole("tab");
    expect(contents?.textContent).toBe("Contents");
    expect(links?.textContent).toBe("Links 1");
    expect(contents?.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toContain("How it works");

    await user.click(links!);
    expect(links?.getAttribute("aria-selected")).toBe("true");
    expect(
      within(screen.getByRole("tabpanel")).getByRole("link", { name: "Unicode TR51" }),
    ).toBeTruthy();
  });

  test("arrow keys switch tabs from the keyboard", async () => {
    const user = userEvent.setup();
    const list = renderBody();
    const [contents, links] = within(list).getAllByRole("tab");
    contents!.focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(links);
    expect(links?.getAttribute("aria-selected")).toBe("true");
    expect(contents?.tabIndex).toBe(-1);
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { describe, expect, test, vi } from "vitest";
import { type BlogPost, BlogsClient } from "@/app/(site)/blogs/blogs-client";

vi.mock("@repo/sounds/sound-player", () => ({ playCue: () => {} }));
vi.mock("@/lib/analytics/events", () => ({ track: () => {} }));
vi.mock("@/app/(site)/blogs/post-card", () => ({
  PostCard: ({ post }: { post: BlogPost }) => <span>{post.title}</span>,
}));

const posts: BlogPost[] = ["First", "Second", "Third"].map((title, index) => ({
  url: `/blog/${title.toLowerCase()}`,
  title,
  number: index + 1,
  cover: null,
}));

function renderList(search: string) {
  const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>();
  render(
    <NuqsTestingAdapter searchParams={search} onUrlUpdate={onUrlUpdate}>
      <BlogsClient posts={posts} allTags={[]} filler={null} />
    </NuqsTestingAdapter>,
  );
  return onUrlUpdate;
}

describe("blog list paging", () => {
  test("page links are real links that change the page in place", async () => {
    const user = userEvent.setup();
    renderList("?per=1");

    const nav = screen.getByRole("navigation", { name: "Blog pages" });
    expect(nav).toBeTruthy();
    const second = screen.getByRole("link", { name: "Go to page 2" });
    expect(second.getAttribute("href")).toBe("?page=2&per=1");
    expect(
      screen.getByRole("link", { name: "Go to page 1" }).getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen.getByRole("link", { name: "Go to previous page" }).getAttribute("aria-disabled"),
    ).toBe("true");

    await user.click(second);
    expect(await screen.findByText("Second")).toBeTruthy();
    expect(screen.queryByText("First")).toBeNull();
    expect(
      screen.getByRole("link", { name: "Go to page 2" }).getAttribute("aria-current"),
    ).toBe("page");
  });

  test("choosing a page size goes back to the first page", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = renderList("?per=1&page=2");

    await user.click(screen.getByRole("combobox", { name: "Posts per page" }));
    await user.click(await screen.findByRole("option", { name: "5 per page" }));

    const last = onUrlUpdate.mock.lastCall?.[0];
    expect(last?.searchParams.get("per")).toBe("5");
    expect(last?.searchParams.get("page")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "Blog pages" })).toBeNull();
  });
});

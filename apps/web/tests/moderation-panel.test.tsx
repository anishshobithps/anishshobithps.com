import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, test, vi } from "vitest";
import {
  CommentsPanel,
  GuestbookPanel,
} from "@/app/admin/_components/moderation-panel";

const actions = vi.hoisted(() => ({
  togglePinComment: vi.fn(async () => ({ success: true as const })),
  deleteComment: vi.fn(async () => ({ success: true as const })),
  togglePinEntry: vi.fn(async () => ({ success: true as const })),
  deleteGuestbookEntry: vi.fn(async () => ({ success: true as const })),
}));

const user = (name: string) => ({ id: name, name, username: name.toLowerCase(), imageUrl: "" });

vi.mock("@/app/admin/actions", () => ({
  getAllAdminComments: async () => [
    { id: 1, postSlug: "/blog/emoji", parentId: null, body: "Great post", isPinned: false, createdAt: "2026-11-01", likeCount: 2, user: user("Ada") },
    { id: 2, postSlug: "/blog/emoji", parentId: 1, body: "Agreed", isPinned: true, createdAt: "2026-11-02", likeCount: 0, user: user("Lin") },
    { id: 3, postSlug: "/blog/resume", parentId: null, body: "Nice resume", isPinned: false, createdAt: "2026-11-03", likeCount: 1, user: user("Sam") },
  ],
  getAllAdminGuestbookEntries: async () => [
    { id: 9, message: "Hello there", isPinned: false, createdAt: "2026-11-04", likeCount: 0, user: user("Kai") },
  ],
}));
vi.mock("@/app/(site)/blog/[[...slug]]/actions", () => ({
  togglePinComment: actions.togglePinComment,
  deleteComment: actions.deleteComment,
}));
vi.mock("@/app/(site)/guestbook/actions", () => ({
  togglePinEntry: actions.togglePinEntry,
  deleteGuestbookEntry: actions.deleteGuestbookEntry,
}));
vi.mock("@/lib/toast", () => ({ toast: { success: () => {} }, toastError: () => {} }));

function renderPanel(panel: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <NuqsTestingAdapter>{panel}</NuqsTestingAdapter>
    </QueryClientProvider>,
  );
}

describe("ModerationPanel", () => {
  test("comments are grouped by post and searchable", async () => {
    const userEvents = userEvent.setup();
    renderPanel(<CommentsPanel />);

    expect(await screen.findByRole("heading", { name: "Emoji" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Resume" })).toBeTruthy();
    expect(screen.getByText("Reply")).toBeTruthy();

    await userEvents.type(screen.getByRole("textbox", { name: "Search comments, names…" }), "resume");
    expect(screen.queryByRole("heading", { name: "Emoji" })).toBeNull();
    expect(screen.getByText("Nice resume")).toBeTruthy();
  });

  test("pinning a comment calls the comment action", async () => {
    const userEvents = userEvent.setup();
    renderPanel(<CommentsPanel />);

    const [pin] = await screen.findAllByRole("button", { name: "Pin comment" });
    await userEvents.click(pin!);
    expect(actions.togglePinComment).toHaveBeenCalledWith(1);
  });

  test("the guestbook panel is one ungrouped list using entry wording", async () => {
    const userEvents = userEvent.setup();
    renderPanel(<GuestbookPanel />);

    expect(await screen.findByText("Hello there")).toBeTruthy();
    expect(screen.queryByRole("heading")).toBeNull();
    await userEvents.click(screen.getByRole("button", { name: "Pin entry" }));
    expect(actions.togglePinEntry).toHaveBeenCalledWith(9);
  });
});

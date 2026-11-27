import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import type { CommentWithMeta } from "@/app/(site)/blog/[[...slug]]/actions";
import { CommentCard } from "@/app/(site)/blog/[[...slug]]/_components/comment-card";

vi.mock("@/components/shared/site-auth", () => ({
  SignInTrigger: ({ children }: { children: React.ReactNode }) => children,
}));

const comment: CommentWithMeta = {
  id: 1,
  slug: "post",
  parentId: null,
  body: "Great post.",
  isPinned: false,
  createdAt: new Date().toISOString(),
  likeCount: 0,
  likedByMe: false,
  user: { id: "u1", name: "Ada", imageUrl: "" } as CommentWithMeta["user"],
  replies: [],
};

function renderCard(onReply = vi.fn(async () => true)) {
  render(
    <ul>
      <CommentCard
        comment={comment}
        currentUserId="u2"
        depth={0}
        isSignedIn
        onLike={() => {}}
        onDelete={() => {}}
        onReply={onReply}
        pendingLikes={new Set()}
      />
    </ul>,
  );
  return { onReply, reply: screen.getByRole("button", { name: "Reply to comment" }) };
}

describe("comment reply", () => {
  test("the reply button opens and closes the reply box", async () => {
    const user = userEvent.setup();
    const { reply } = renderCard();

    expect(reply.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("textbox", { name: "Write a reply" })).toBeNull();

    await user.click(reply);
    expect(reply.getAttribute("aria-expanded")).toBe("true");
    const box = screen.getByRole("textbox", { name: "Write a reply" });
    expect(document.activeElement).toBe(box);
    expect(reply.getAttribute("aria-controls")).toBeTruthy();

    await user.click(reply);
    expect(screen.queryByRole("textbox", { name: "Write a reply" })).toBeNull();
  });

  test("a sent reply closes the box", async () => {
    const user = userEvent.setup();
    const { reply, onReply } = renderCard();

    await user.click(reply);
    await user.type(screen.getByRole("textbox", { name: "Write a reply" }), "Thanks!");
    await user.click(screen.getByRole("button", { name: "Reply" }));
    expect(onReply).toHaveBeenCalledWith(1, "Thanks!");
    expect(await screen.findByRole("button", { name: "Reply to comment" })).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: "Write a reply" })).toBeNull();
  });

  test("mod+enter sends the reply, plain enter adds a line", async () => {
    const user = userEvent.setup();
    const { reply, onReply } = renderCard();
    const mod = /Mac|iPhone|iPad/.test(navigator.platform) ? "Meta" : "Control";

    await user.click(reply);
    const box = screen.getByRole("textbox", { name: "Write a reply" });
    await user.type(box, "Nice{Enter}post");
    expect(onReply).not.toHaveBeenCalled();

    await user.keyboard(`{${mod}>}{Enter}{/${mod}}`);
    expect(onReply).toHaveBeenCalledWith(1, "Nice\npost");
  });
});

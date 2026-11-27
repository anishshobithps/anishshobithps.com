import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { LikeToggle } from "@/components/engagement/like-toggle";

const agent = createAgent();

function Harness({ onToggle }: { onToggle: () => void }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(2);
  return (
    <LikeToggle
      count={count}
      liked={liked}
      onToggle={() => {
        onToggle();
        setCount((c) => c + (liked ? -1 : 1));
        setLiked(!liked);
      }}
    />
  );
}

describe("LikeToggle", () => {
  test("is a toggle that keeps its name and reports pressed", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<Harness onToggle={onToggle} />);

    const like = screen.getByRole("button", { name: "Like (2)" });
    expect(like.getAttribute("aria-pressed")).toBe("false");
    await user.click(like);
    expect(onToggle).toHaveBeenCalledTimes(1);
    const liked = screen.getByRole("button", { name: "Like (3)" });
    expect(liked.getAttribute("aria-pressed")).toBe("true");
  });

  test("is disabled and busy while pending", () => {
    render(<LikeToggle count={1} liked={false} pending onToggle={() => {}} />);
    const like = screen.getByRole("button", { name: "Like (1)" });
    expect(like.hasAttribute("disabled")).toBe(true);
    expect(like.getAttribute("aria-busy")).toBe("true");
  });

  test("an agent can like by name", async () => {
    const onToggle = vi.fn();
    render(<Harness onToggle={onToggle} />);
    const result = await agent.act({
      steps: [{ ref: "Like", action: "setPressed", args: [true] }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

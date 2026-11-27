import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { describe, expect, test, vi } from "vitest";
import { FloatingHub } from "@/components/hub/floating-hub";

vi.mock("@repo/sounds/sound-player", () => ({ playCue: () => {} }));

vi.mock("next/dynamic", () => ({
  default:
    () =>
    ({ onClose }: { onClose: () => void }) => (
      <button type="button" onClick={onClose}>
        Jump to comments
      </button>
    ),
}));

const agent = createAgent();

describe("FloatingHub", () => {
  test("the button opens the quick menu and Escape closes it", async () => {
    const user = userEvent.setup();
    render(<FloatingHub repoCard={null} />);

    const fab = await screen.findByRole("button", { name: "Open quick menu" });
    expect(fab.getAttribute("aria-expanded")).toBe("false");

    await user.click(fab);
    expect(await screen.findByRole("dialog", { name: "Quick menu" })).toBeTruthy();
    expect(fab.getAttribute("aria-expanded")).toBe("true");
    expect(fab.getAttribute("aria-label")).toBe("Close quick menu");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Quick menu" })).toBeNull();
    expect(document.activeElement).toBe(fab);
  });

  test("an action inside the menu closes it", async () => {
    const user = userEvent.setup();
    render(<FloatingHub repoCard={null} />);

    await user.click(await screen.findByRole("button", { name: "Open quick menu" }));
    await user.click(await screen.findByRole("button", { name: "Jump to comments" }));
    expect(screen.queryByRole("dialog", { name: "Quick menu" })).toBeNull();
  });

  test("an agent can open the quick menu", async () => {
    render(<FloatingHub repoCard={null} />);
    await screen.findByRole("button", { name: "Open quick menu" });
    const result = await agent.act({
      steps: [{ ref: "Open quick menu", action: "open" }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(await screen.findByRole("dialog", { name: "Quick menu" })).toBeTruthy();
  });
});

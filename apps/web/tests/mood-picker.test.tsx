import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import type { MoodId } from "@/app/(site)/blog/[[...slug]]/actions";
import {
  MoodPicker,
  type MoodState,
} from "@/app/(site)/blog/[[...slug]]/_components/mood-picker";

const agent = createAgent();

function Harness({
  initial,
  onSelect,
}: {
  initial: MoodState;
  onSelect: (id: MoodId) => void;
}) {
  const [mood, setMood] = useState(initial);
  return (
    <MoodPicker
      moodOptimistic={mood}
      moodLoading={false}
      onSelect={(id) => {
        onSelect(id);
        setMood((prev) => ({ ...prev, value: prev.value === id ? "" : id }));
      }}
    />
  );
}

function renderPicker(mood: MoodState, onSelect = vi.fn()) {
  render(<Harness initial={mood} onSelect={onSelect} />);
  return { onSelect, group: screen.getByRole("group", { name: "Rate this post" }) };
}

function toggles(group: HTMLElement) {
  return within(group).getAllByRole("button");
}

describe("MoodPicker", () => {
  test("is a named group of four toggles reporting the current mood", () => {
    const { group } = renderPicker({ value: "good", counts: { good: 2 } });
    expect(toggles(group).map((t) => t.getAttribute("aria-label"))).toEqual([
      "Not for me",
      "Meh",
      "Liked it, 2 reactions",
      "Loved it",
    ]);
    expect(toggles(group).map((t) => t.getAttribute("aria-pressed"))).toEqual([
      "false",
      "false",
      "true",
      "false",
    ]);
    expect(toggles(group).filter((t) => t.tabIndex === 0)).toHaveLength(1);
  });

  test("pressing a mood selects it", async () => {
    const user = userEvent.setup();
    const { onSelect, group } = renderPicker({ value: "", counts: {} });
    await user.click(within(group).getByRole("button", { name: "Meh" }));
    expect(onSelect).toHaveBeenCalledWith("bad");
  });

  test("pressing the chosen mood again asks to clear it", async () => {
    const user = userEvent.setup();
    const { onSelect, group } = renderPicker({ value: "good", counts: { good: 1 } });
    await user.click(within(group).getByRole("button", { name: /Liked it/ }));
    expect(onSelect).toHaveBeenCalledWith("good");
    expect(
      toggles(group).every((t) => t.getAttribute("aria-pressed") === "false"),
    ).toBe(true);
  });

  test("arrow keys move between moods and Space presses one", async () => {
    const user = userEvent.setup();
    const { onSelect, group } = renderPicker({ value: "", counts: {} });
    await user.tab();
    expect(document.activeElement).toBe(toggles(group)[0]);
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(document.activeElement).toBe(toggles(group)[2]);
    await user.keyboard(" ");
    expect(onSelect).toHaveBeenCalledWith("good");
    await user.tab();
    expect(group.contains(document.activeElement)).toBe(false);
  });

  test("an agent can press a mood by its name", async () => {
    const { onSelect } = renderPicker({ value: "", counts: {} });
    const components = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== "more");
    for (const entry of components) {
      expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
    }
    expect(components.map((entry) => entry.label)).toEqual(
      expect.arrayContaining(["Rate this post", "Loved it"]),
    );

    const result = await agent.act({
      steps: [{ ref: "Loved it", action: "setPressed", args: [true] }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(onSelect).toHaveBeenCalledWith("amazing");
    expect(
      screen.getByRole("button", { name: "Loved it" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });
});

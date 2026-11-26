import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { settle } from "@ui-sdk/core/testing";
import { createAgent } from "@ui-sdk/react/agent";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { TagFilter } from "@/app/(site)/blogs/tag-filter";

const allTags = ["Accessibility", "Effect", "LaTeX", "TypeScript"];

const agent = createAgent();

function Harness({
  initial = [],
  onChange,
}: {
  initial?: string[];
  onChange?: (tags: string[]) => void;
}) {
  const [tags, setTags] = useState(initial);
  return (
    <TagFilter
      allTags={allTags}
      tags={tags}
      onTagsChange={(next) => {
        onChange?.(next);
        setTags(next);
      }}
    />
  );
}

function chips() {
  return Array.from(
    document.querySelectorAll('[data-slot="combobox-chip"]'),
    (chip) => chip.textContent,
  );
}

describe("TagFilter", () => {
  test("is a combobox named by its label with every control named", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "Filter by tags" });
    expect(input).toHaveProperty("placeholder", "Filter by tag…");
    expect(screen.getByRole("button", { name: "Show tags" })).toBeTruthy();
    expect(chips()).toEqual([]);
  });

  test("typing filters the tags and Enter picks the highlighted one", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Filter by tags" }));
    await user.keyboard("lat");
    const options = screen.getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["LaTeX"]);

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(["LaTeX"]);
    expect(chips()).toEqual(["LaTeX"]);
    expect(
      screen.getByRole("combobox", { name: "Filter by tags" }),
    ).toHaveProperty("value", "");
  });

  test("choosing keeps the list open and adds to the selection", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness initial={["Effect"]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Show tags" }));
    const listbox = screen.getByRole("listbox");
    expect(
      within(listbox).getByRole("option", { name: "Effect" }),
    ).toHaveProperty("ariaSelected", "true");

    await user.click(within(listbox).getByRole("option", { name: "TypeScript" }));
    expect(onChange).toHaveBeenLastCalledWith(["Effect", "TypeScript"]);
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  test("a chip's remove button drops only that tag", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness initial={["Effect", "LaTeX"]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Remove Effect filter" }));
    expect(onChange).toHaveBeenLastCalledWith(["LaTeX"]);
    expect(chips()).toEqual(["LaTeX"]);
  });

  test("Backspace in the empty input removes the last chip", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness initial={["Effect", "LaTeX"]} onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Filter by tags" }));
    await user.keyboard("{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith(["Effect"]);
  });

  test("clear empties every tag and keeps focus in the input", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness initial={["Effect", "LaTeX"]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Clear all tag filters" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(chips()).toEqual([]);
    expect(document.activeElement).toBe(
      screen.getByRole("combobox", { name: "Filter by tags" }),
    );
  });

  test("a query with no match says so", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("combobox", { name: "Filter by tags" }));
    await user.keyboard("zzz");
    expect(screen.queryAllByRole("option")).toEqual([]);
    expect(screen.getByText("No tags match.")).toBeTruthy();
  });

  test("an agent can find the filter and pick tags by name", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    const components = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== "more");
    for (const entry of components) {
      expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
    }
    expect(components.map((entry) => entry.label)).toContain("Filter by tags");

    const result = await agent.act({
      steps: [
        {
          ref: "Filter by tags",
          action: "setValue",
          args: [["Effect", "TypeScript"]],
        },
      ],
    });
    await act(() => settle());
    expect(result.ok, result.error?.message).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(["Effect", "TypeScript"]);
    expect(chips()).toEqual(["Effect", "TypeScript"]);
  });
});

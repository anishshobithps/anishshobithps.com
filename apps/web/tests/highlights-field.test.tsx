import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from "@repo/ui/components/form";
import { PROJECT_LIMITS } from "@repo/core/projects-schema";
import { useForm } from "react-hook-form";
import { describe, expect, test, vi } from "vitest";
import { HighlightsField } from "@/app/admin/projects/highlights-field";

const agent = createAgent();

const suggestions = ["Bun", "React", "TypeScript"];

function Harness({
  initial = [],
  onSubmit,
}: {
  initial?: string[];
  onSubmit?: (highlights: string[]) => void;
}) {
  const form = useForm<{ highlights: string[] }>({
    defaultValues: { highlights: initial },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit?.(data.highlights))}>
        <FormField
          control={form.control}
          name="highlights"
          render={({ field }) => (
            <FormItem>
              <HighlightsField
                value={field.value}
                onChange={field.onChange}
                suggestions={suggestions}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Save</button>
      </form>
    </Form>
  );
}

function input() {
  return screen.getByRole("combobox", { name: "Tech highlights" });
}

function chips() {
  return Array.from(
    document.querySelectorAll('[data-slot="combobox-chip"]'),
    (chip) => chip.textContent,
  );
}

describe("HighlightsField", () => {
  test("names the combobox with the form label and shows saved highlights", () => {
    render(<Harness initial={["React"]} />);
    expect(input()).toBeTruthy();
    expect(chips()).toEqual(["React"]);
    expect(screen.getByRole("button", { name: "Remove React" })).toBeTruthy();
  });

  test("suggests highlights from other projects", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await user.click(input());
    await user.keyboard("typ{Enter}");
    expect(chips()).toEqual(["TypeScript"]);

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledWith(["TypeScript"]);
  });

  test("adds a highlight nobody has used yet", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness initial={["React"]} onSubmit={onSubmit} />);

    await user.click(input());
    await user.keyboard("Drizzle ORM");
    expect(screen.getByRole("option", { name: /Add “Drizzle ORM”/ })).toBeTruthy();
    await user.keyboard("{Enter}");
    expect(chips()).toEqual(["React", "Drizzle ORM"]);

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledWith(["React", "Drizzle ORM"]);
  });

  test("Enter in the field does not submit the form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await user.click(input());
    await user.keyboard("Hono{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("a chip's remove button and Backspace drop highlights", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["Bun", "React", "TypeScript"]} />);

    await user.click(screen.getByRole("button", { name: "Remove React" }));
    expect(chips()).toEqual(["Bun", "TypeScript"]);

    await user.click(input());
    await user.keyboard("{Backspace}");
    expect(chips()).toEqual(["Bun"]);
  });

  test("stops at the highlight limit", async () => {
    const user = userEvent.setup();
    const full = Array.from(
      { length: PROJECT_LIMITS.highlights },
      (_, index) => `Tool ${index + 1}`,
    );
    render(<Harness initial={full} />);

    await user.click(input());
    await user.keyboard("Bun");
    expect(
      screen.getByRole("option", { name: "Bun" }).getAttribute("aria-disabled"),
    ).toBe("true");
  });

  test("an agent can set the highlights by name", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    const components = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== "more");
    for (const entry of components) {
      expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
    }
    expect(components.map((entry) => entry.label)).toContain("Tech highlights");

    const result = await agent.act({
      steps: [
        { ref: "Tech highlights", action: "setValue", args: [["Bun", "React"]] },
      ],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(chips()).toEqual(["Bun", "React"]);
  });
});

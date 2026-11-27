import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { describe, expect, test, vi } from "vitest";
import { Input } from "@repo/ui/components/input";
import { InputGroup, InputGroupInput } from "@repo/ui/components/input-group";
import { Textarea } from "@repo/ui/components/textarea";

const agent = createAgent();

function HookForm({ onSubmit }: { onSubmit: (values: { path: string }) => void }) {
  const form = useForm({ defaultValues: { path: "" } });
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input aria-label="Path" {...form.register("path")} />
      <button type="submit">Save</button>
    </form>
  );
}

function Controlled({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <Textarea
      aria-label="Write a reply"
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
        onChange(event.target.value);
      }}
    />
  );
}

describe("@repo/ui input and textarea", () => {
  test("react-hook-form registers and submits the typed value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<HookForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Path" }), "cv");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ path: "cv" });
  });

  test("a controlled textarea keeps native onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    const box = screen.getByRole("textbox", { name: "Write a reply" }) as HTMLTextAreaElement;
    await user.type(box, "hi");
    expect(box.value).toBe("hi");
    expect(onChange).toHaveBeenLastCalledWith("hi");
  });

  test("an input group control is marked for the group's focus ring", () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Search blog posts" />
      </InputGroup>,
    );
    expect(
      screen
        .getByRole("textbox", { name: "Search blog posts" })
        .hasAttribute("data-input-group-control"),
    ).toBe(true);
  });

  test("an agent can fill a field by its name", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    const result = await agent.act({
      steps: [{ ref: "Write a reply", action: "setValue", args: ["Thanks!"] }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith("Thanks!");
  });
});

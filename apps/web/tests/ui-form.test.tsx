import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, test } from "vitest";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";

function LinkForm() {
  const form = useForm({ defaultValues: { path: "", note: "" } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField control={form.control} name="path" rules={{ required: "Path is required" }} render={({ field }) => (
          <FormItem>
            <FormLabel>Path</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormDescription>Short path</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="note" render={({ field }) => (
          <FormItem>
            <FormLabel>Note</FormLabel>
            <FormControl><Textarea {...field} /></FormControl>
          </FormItem>
        )} />
        <button type="submit">Save</button>
      </form>
    </Form>
  );
}

describe("@repo/ui form with ui-sdk fields", () => {
  test("labels, descriptions and errors reach the ui-sdk input", async () => {
  const user = userEvent.setup();
  render(<LinkForm />);
  const path = screen.getByRole("textbox", { name: "Path" });
  const note = screen.getByRole("textbox", { name: "Note" });
  expect(path.getAttribute("aria-describedby")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(path.getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByText("Path is required")).toBeTruthy();
  expect(note).toBeTruthy();
});
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import {
  FormActions,
  FormDialog,
  RowActions,
} from "@/app/admin/_components/crud";

describe("admin crud pieces", () => {
  test("row actions name their noun and run edit and delete", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <RowActions
        noun="link"
        disabled={false}
        onEdit={onEdit}
        onDelete={onDelete}
        deleteTitle="Delete /cv?"
        deleteDescription="Removes the link."
        deleteConfirm="Permanently deletes /cv"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit link" }));
    expect(onEdit).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Delete link" }));
    await user.click(await screen.findByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  test("the form dialog is named by its title and its actions cancel or show progress", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { rerender } = render(
      <FormDialog open onOpenChange={() => {}} title="Add Link" description="Create a short link.">
        <form>
          <FormActions onCancel={onCancel} submitting={false} />
        </form>
      </FormDialog>,
    );

    expect(await screen.findByRole("dialog", { name: "Add Link" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    rerender(
      <FormDialog open onOpenChange={() => {}} title="Add Link" description="Create a short link.">
        <form>
          <FormActions onCancel={onCancel} submitting />
        </form>
      </FormDialog>,
    );
    expect(screen.getByRole("button", { name: "Save" }).getAttribute("aria-busy")).toBe("true");
  });
});

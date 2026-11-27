import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { describe, expect, test, vi } from "vitest";
import { ConfirmDelete } from "@/app/admin/_components/confirm-delete";

function renderConfirm() {
  const onConfirm = vi.fn();
  render(
    <ConfirmDelete
      trigger={<button type="button" aria-label="Delete link" />}
      title="Delete /cv?"
      description="This permanently removes the link."
      confirm="Permanently deletes the short link /cv"
      onConfirm={onConfirm}
    />,
  );
  return onConfirm;
}

describe("ConfirmDelete", () => {
  test("asks first, starts on Cancel, and deletes only on Delete", async () => {
    const user = userEvent.setup();
    const onConfirm = renderConfirm();

    await user.click(screen.getByRole("button", { name: "Delete link" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Delete /cv?" });
    expect(dialog).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancel" }));

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete link" }));
    await user.click(await screen.findByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  test("an agent cannot delete without the person", async () => {
    const user = userEvent.setup();
    const onConfirm = renderConfirm();
    await user.click(screen.getByRole("button", { name: "Delete link" }));
    await screen.findByRole("alertdialog");

    const result = await createAgent().act({
      steps: [{ ref: "Delete /cv?", action: "press", args: ["Delete"] }],
    });
    expect(result.ok).toBe(false);
    expect(result.error?.message).toMatch(/Needs a person/);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

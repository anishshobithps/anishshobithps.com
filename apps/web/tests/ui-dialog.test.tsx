import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

function Harness({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Add link
      </button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next);
          setOpen(next);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>Create a short link.</DialogDescription>
          </DialogHeader>
          <input aria-label="Path" />
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </>
  );
}

describe("@repo/ui dialog", () => {
  test("a controlled dialog is named, described, and closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole("button", { name: "Add link" }));
    const dialog = await screen.findByRole("dialog", { name: "Add Link" });
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("both close buttons close it", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole("button", { name: "Add link" }));
    const closes = await screen.findAllByRole("button", { name: "Close" });
    expect(closes).toHaveLength(2);
    await user.click(closes[0]!);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

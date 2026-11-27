import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test } from "vitest";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@repo/ui/components/sheet";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open sidebar
      </button>
      <Sheet open={open} onOpenChange={setOpen} side="left">
        <SheetContent>
          <SheetTitle>Sidebar</SheetTitle>
          <SheetDescription>Admin pages</SheetDescription>
          <button type="button">Overview</button>
        </SheetContent>
      </Sheet>
    </>
  );
}

describe("@repo/ui sheet", () => {
  test("opens from the given side as a named dialog and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Open sidebar" }));
    const sheet = await screen.findByRole("dialog", { name: "Sidebar" });
    expect(sheet.getAttribute("data-side")).toBe("left");
    expect(screen.getByRole("button", { name: "Overview" })).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Sidebar" })).toBeNull();
  });
});

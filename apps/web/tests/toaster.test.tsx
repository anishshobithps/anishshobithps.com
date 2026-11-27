import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast as sdkToast } from "@ui-sdk/react/toast";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ToasterHost } from "@/components/shared/toaster-host";
import { toast, typedToast } from "@/lib/toast";

vi.mock("@repo/sounds/sound-player", () => ({ playCue: () => {} }));
vi.mock("next/dynamic", async () => {
  const { Toaster } = await import("@/components/shared/toaster");
  return { default: () => Toaster };
});

describe("toasts", () => {
  afterEach(() => act(() => sdkToast.dismiss()));

  test("a toast shows its title and description in a named region", async () => {
    render(<ToasterHost />);
    act(() => toast.success("Email copied", { description: "hi@example.com" }));

    expect(await screen.findByText("Email copied")).toBeTruthy();
    expect(screen.getByText("hi@example.com")).toBeTruthy();
    expect(screen.getByRole("region")).toBeTruthy();
  });

  test("a confirm toast runs its action or keeps things on cancel", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<ToasterHost />);
    act(() =>
      toast("Delete this message?", {
        action: { label: "Delete", onAction },
        cancel: { label: "Keep" },
        duration: Infinity,
      }),
    );

    await user.click(await screen.findByRole("button", { name: "Keep" }));
    expect(onAction).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText("Delete this message?")).toBeNull());

    act(() =>
      toast("Delete this message?", {
        action: { label: "Delete", onAction },
        cancel: { label: "Keep" },
        duration: Infinity,
      }),
    );
    await user.click(await screen.findByRole("button", { name: "Delete" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  test("errors stay until closed", async () => {
    const user = userEvent.setup();
    render(<ToasterHost />);
    act(() => typedToast("error", "Couldn't save"));

    await user.click(await screen.findByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByText("Couldn't save")).toBeNull());
  });
});

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CommandMenu } from "@/components/command-menu/menu";
import {
  getCommandMenuOpen,
  setCommandMenuOpen,
} from "@/components/command-menu/store";

const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next-themes", () => ({ useTheme: () => ({ setTheme: () => {} }) }));
vi.mock("@repo/sounds/sound-player", () => ({
  playCue: () => {},
  enableSound: async () => {},
  disableSound: () => {},
}));
vi.mock("@c15t/nextjs/headless", () => ({
  useHeadlessConsentUI: () => ({ openDialog: () => {} }),
}));
vi.mock("@/lib/analytics/events", () => ({ track: () => {} }));

function openMenu() {
  render(<CommandMenu />);
  act(() => setCommandMenuOpen(true));
}

describe("CommandMenu", () => {
  afterEach(() => {
    act(() => setCommandMenuOpen(false));
    push.mockClear();
  });

  test("is a named dialog whose search filters the commands", async () => {
    const user = userEvent.setup();
    openMenu();

    expect(await screen.findByRole("dialog", { name: "Command menu" })).toBeTruthy();
    const search = screen.getByRole("combobox", { name: "Search commands" });
    expect(document.activeElement).toBe(search);

    await user.type(search, "zzzz");
    expect(screen.getByText("No results found.")).toBeTruthy();
  });

  test("Enter runs the highlighted command and closes the menu", async () => {
    const user = userEvent.setup();
    openMenu();

    const search = await screen.findByRole("combobox", { name: "Search commands" });
    await user.type(search, "projects");
    await user.keyboard("{Enter}");

    expect(push).toHaveBeenCalledWith("/projects");
    expect(getCommandMenuOpen()).toBe(false);
  });

  test("Escape clears the search, then closes the menu", async () => {
    const user = userEvent.setup();
    openMenu();

    const search = await screen.findByRole("combobox", { name: "Search commands" });
    await user.type(search, "blog");
    await user.keyboard("{Escape}");
    expect((search as HTMLInputElement).value).toBe("");
    expect(getCommandMenuOpen()).toBe(true);

    await user.keyboard("{Escape}");
    expect(getCommandMenuOpen()).toBe(false);
  });
});

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { shortcuts } from "@ui-sdk/react/shortcuts";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CommandMenuHost } from "@/components/command-menu/host";
import {
  getCommandMenuOpen,
  setCommandMenuOpen,
} from "@/components/command-menu/store";
import { ThemeHotkey } from "@/components/preferences/theme-hotkey";

const setTheme = vi.hoisted(() => vi.fn());

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", resolvedTheme: "dark", setTheme }),
}));
vi.mock("@repo/sounds/sound-player", () => ({ playCue: () => {} }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));

const mod = /Mac|iPhone|iPad/.test(navigator.platform) ? "Meta" : "Control";

describe("site shortcuts", () => {
  afterEach(() => setCommandMenuOpen(false));

  test("mod+k toggles the command menu", async () => {
    const user = userEvent.setup();
    render(<CommandMenuHost />);

    await user.keyboard(`{${mod}>}k{/${mod}}`);
    expect(getCommandMenuOpen()).toBe(true);
    await user.keyboard(`{${mod}>}k{/${mod}}`);
    expect(getCommandMenuOpen()).toBe(false);
  });

  test("mod+shift+d switches the theme", async () => {
    const user = userEvent.setup();
    render(<ThemeHotkey />);

    await user.keyboard(`{${mod}>}{Shift>}D{/Shift}{/${mod}}`);
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  test("both are listed with descriptions", () => {
    render(
      <>
        <CommandMenuHost />
        <ThemeHotkey />
      </>,
    );
    const listed = shortcuts.list().map((entry) => entry.description);
    expect(listed).toContain("Search and commands");
    expect(listed).toContain("Toggle light and dark theme");
  });
});

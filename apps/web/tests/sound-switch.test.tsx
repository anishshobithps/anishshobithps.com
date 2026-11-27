import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { setSoundEnabled } from "@repo/sounds/sound-preferences";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SoundSwitch } from "@/components/preferences/sound-controls";

vi.mock("@repo/sounds/sound-player", async () => {
  const prefs = await import("@repo/sounds/sound-preferences");
  return {
    enableSound: async () => prefs.setSoundEnabled(true),
    disableSound: () => prefs.setSoundEnabled(false),
  };
});

const agent = createAgent();

describe("SoundSwitch", () => {
  beforeEach(() => setSoundEnabled(false));

  for (const look of ["button", "track", "pill"] as const) {
    test(`the ${look} look is a sound switch that turns on and off`, async () => {
      const user = userEvent.setup();
      render(<SoundSwitch look={look} />);
      const control = screen.getByRole("switch", { name: "Sound effects" });
      expect(control.getAttribute("aria-checked")).toBe("false");

      await user.click(control);
      expect(control.getAttribute("aria-checked")).toBe("true");
      await user.keyboard(" ");
      expect(control.getAttribute("aria-checked")).toBe("false");
    });
  }

  test("an agent can turn sound on by name", async () => {
    render(<SoundSwitch look="button" />);
    const result = await agent.act({
      steps: [{ ref: "Sound effects", action: "setChecked", args: [true] }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(
      screen.getByRole("switch", { name: "Sound effects" }).getAttribute("aria-checked"),
    ).toBe("true");
  });
});

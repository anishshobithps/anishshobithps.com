import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ConsentDialog } from "@/components/consent/consent-dialog";

const ui = vi.hoisted(() => ({
  dialog: { isVisible: true, blocking: true },
  closeUI: vi.fn(),
}));

vi.mock("@c15t/nextjs", () => ({
  ConsentDraftProvider: ({ children }: { children: React.ReactNode }) => children,
  useModel: () => "opt-in",
  useTranslations: () => ({
    common: { close: "Close" },
    consentManagerDialog: {
      title: "Privacy settings",
      description: "Choose what this site may measure.",
    },
  }),
}));

vi.mock("@c15t/nextjs/headless", () => ({
  useIABPolicyGuard: () => {},
  useConsentTextDirection: () => "ltr",
  useHeadlessConsentUI: () => ui,
}));

vi.mock("@/components/consent/consent-preferences", () => ({
  ConsentPreferences: () => null,
  ConsentPreferencesActions: () => <button type="button">Save Settings</button>,
}));

describe("ConsentDialog", () => {
  beforeEach(() => ui.closeUI.mockClear());

  test("is a named modal dialog that Escape closes", async () => {
    const user = userEvent.setup();
    render(<ConsentDialog />);
    const dialog = screen.getByRole("dialog", { name: "Privacy settings" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    await user.keyboard("{Escape}");
    expect(ui.closeUI).toHaveBeenCalledTimes(1);
  });

  test("the close button closes it", async () => {
    const user = userEvent.setup();
    render(<ConsentDialog />);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(ui.closeUI).toHaveBeenCalledTimes(1);
  });
});

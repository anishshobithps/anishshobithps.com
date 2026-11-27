import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";

describe("@repo/ui collapsible", () => {
  test("the trigger shows and hides the panel and marks the root open", async () => {
    const user = userEvent.setup();
    render(
      <Collapsible className="group" data-testid="root">
        <CollapsibleTrigger>Analytics vendors</CollapsibleTrigger>
        <CollapsibleContent aria-label="Analytics vendors">PostHog</CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByRole("button", { name: "Analytics vendors" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("PostHog")).toBeNull();

    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("PostHog")).toBeTruthy();
    expect(screen.getByTestId("root").hasAttribute("data-open")).toBe(true);
  });

  test("asChild renders the trigger as the given element", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <button type="button" className="custom">
            More
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>Hidden</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "More" });
    expect(trigger.className).toContain("custom");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});

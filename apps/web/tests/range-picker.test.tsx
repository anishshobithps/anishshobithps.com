import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { describe, expect, test, vi } from "vitest";
import { RangePicker } from "@/app/admin/_components/range-picker";

const agent = createAgent();

function renderPicker(search = "") {
  const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>();
  render(
    <NuqsTestingAdapter searchParams={search} onUrlUpdate={onUrlUpdate} hasMemory>
      <RangePicker />
    </NuqsTestingAdapter>,
  );
  return onUrlUpdate;
}

describe("RangePicker", () => {
  test("is one radio group with the current range checked", () => {
    renderPicker();
    expect(screen.getByRole("radiogroup", { name: "Date range" })).toBeTruthy();
    expect(
      screen.getByRole("radio", { name: "Last 30 days" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  test("arrow keys move the range and update the URL", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = renderPicker("?range=30d");

    await user.click(screen.getByRole("radio", { name: "Last 30 days" }));
    await user.keyboard("{ArrowRight}");

    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("range")).toBe("90d");
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: "Last 90 days" }).getAttribute("aria-checked"),
      ).toBe("true"),
    );
  });

  test("an agent can pick a range by name", async () => {
    const onUrlUpdate = renderPicker();
    const result = await agent.act({
      steps: [{ ref: "Date range", action: "setValue", args: ["7d"] }],
    });
    expect(result.ok, result.error?.message).toBe(true);
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("range")).toBe("7d");
  });
});

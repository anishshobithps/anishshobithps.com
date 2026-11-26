import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { PostRevisions } from "@/app/(site)/blog/[[...slug]]/_components/post-revisions";

const entries = [
  { day: "2026-11-13", kind: "correction" as const, note: "Fixed the heart code point." },
  { day: "2026-11-13", kind: "addition" as const, note: "Added the Slack note." },
  { day: "2026-11-12", kind: "sources" as const, note: "Numbered the sources." },
];

async function openLog() {
  const user = userEvent.setup();
  render(
    <PostRevisions slug="emoji" entries={entries} publishedDay="2026-03-19" />,
  );
  await user.click(screen.getByRole("button", { name: /Revised/ }));
  return { user, log: screen.getByRole("list", { name: "Revision log" }) };
}

function events(log: HTMLElement) {
  return Array.from(
    log.querySelectorAll<HTMLElement>(':scope > [data-slot="timeline-item"]'),
  );
}

describe("PostRevisions", () => {
  beforeEach(() => window.localStorage.clear());

  test("lists each day as an event named by its date, ending with Published", async () => {
    const { log } = await openLog();
    const items = events(log);
    expect(items.map((item) => item.getAttribute("role"))).toEqual([
      "listitem",
      "listitem",
      "listitem",
    ]);
    expect(
      items.map((item) =>
        document.getElementById(item.getAttribute("aria-labelledby") ?? "")
          ?.textContent,
      ),
    ).toEqual(["Nov 13, 2026", "Nov 12, 2026", "Published"]);
    expect(within(items[0]!).getByText("Fixed the heart code point.")).toBeTruthy();
    expect(within(items[0]!).getByText("Added the Slack note.")).toBeTruthy();
    expect(
      items[2]!.querySelector("time")?.getAttribute("dateTime"),
    ).toBe("2026-03-19");
  });

  test("the events are one tab stop and arrow keys move between them", async () => {
    const { user, log } = await openLog();
    const items = events(log);
    expect(items.filter((item) => item.tabIndex === 0)).toEqual([items[0]]);

    items[0]!.focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(items[1]);
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(items[2]);
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(items[0]);
  });

  test("days after the last visit are marked new", async () => {
    window.localStorage.setItem("revision-seen:emoji", "2026-11-12");
    const { log } = await openLog();
    const items = events(log);
    expect(within(items[0]!).queryByText("New for you")).toBeTruthy();
    expect(within(items[1]!).queryByText("New for you")).toBeNull();
  });

  test("the marker and connector are hidden from assistive technology", async () => {
    const { log } = await openLog();
    for (const part of log.querySelectorAll(
      '[data-slot="timeline-marker"], [data-slot="timeline-connector"]',
    )) {
      expect(part.getAttribute("aria-hidden")).toBe("true");
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  bucketDurations,
  bucketTimestamps,
  combine,
  emptyMatrix,
  summarize,
  toLevels,
} from "@/lib/svg/data/activity";
import { type CalendarDay, parseContributionsPage, summarizeCalendar } from "@/lib/svg/data/github";
import { describeWeather, formatCoordinates, hourOf, zoneLabel } from "@/lib/svg/data/weather";
import { plural, truncate } from "@/lib/svg/primitives";

const THU = 3;
const FRI = 4;

describe("bucketTimestamps", () => {
  it("uses the local date and hour written in each timestamp", () => {
    const matrix = bucketTimestamps([
      "2026-10-01T23:41:00.000+05:30",
      "2026-10-01T23:02:00.000+05:30",
      "2026-10-02T00:10:00.000-07:00",
      "not a date",
    ]);
    expect(matrix[THU][23]).toBe(2);
    expect(matrix[FRI][0]).toBe(1);
    expect(matrix.flat().reduce((a, b) => a + b, 0)).toBe(3);
  });
});

describe("bucketDurations", () => {
  it("splits a duration across local hour boundaries", () => {
    const start = Date.UTC(2026, 9, 1, 18, 15) / 1000;
    const matrix = bucketDurations([{ time: start, duration: 3600 }], "Asia/Kolkata");
    expect(matrix[THU][23]).toBe(15 * 60);
    expect(matrix[FRI][0]).toBe(45 * 60);
  });
});

describe("combine", () => {
  it("averages each source's share so units don't matter", () => {
    const commits = emptyMatrix();
    commits[0][9] = 3;
    commits[0][10] = 1;
    const seconds = emptyMatrix();
    seconds[0][10] = 7200;

    const matrix = combine([commits, seconds]);
    expect(matrix[0][9]).toBeCloseTo(0.375);
    expect(matrix[0][10]).toBeCloseTo(0.625);
  });

  it("ignores empty sources", () => {
    const commits = emptyMatrix();
    commits[2][4] = 5;
    expect(combine([commits, emptyMatrix()])[2][4]).toBe(1);
  });
});

describe("toLevels", () => {
  it("maps zero to 0, the max to 4, and any activity to at least 1", () => {
    const matrix = emptyMatrix();
    matrix[0][0] = 100;
    matrix[0][1] = 1;
    const levels = toLevels(matrix);
    expect(levels[0][0]).toBe(4);
    expect(levels[0][1]).toBe(1);
    expect(levels[0][2]).toBe(0);
  });

  it("keeps an empty matrix empty", () => {
    expect(toLevels(emptyMatrix()).flat().every((level) => level === 0)).toBe(true);
  });
});

describe("summarize", () => {
  it("reports the peak slot, busiest day, and late-night share", () => {
    const matrix = emptyMatrix();
    matrix[THU][23] = 6;
    matrix[FRI][1] = 2;
    matrix[FRI][14] = 1;
    matrix[FRI][15] = 1;
    expect(summarize(matrix)).toEqual({
      empty: false,
      peak: "Thu 11 PM",
      busiestDay: "Thu",
      lateShare: 80,
    });
  });

  it("flags an empty matrix", () => {
    expect(summarize(emptyMatrix())).toMatchObject({ empty: true, lateShare: 0 });
  });
});

describe("truncate", () => {
  it("leaves short text alone and ellipsizes long text by characters", () => {
    expect(truncate("  Selected work ", 40)).toBe("Selected work");
    expect(truncate("abcdefghij", 6)).toBe("abcde…");
    expect(truncate("😀😀😀😀", 3)).toBe("😀😀…");
  });
});

describe("plural", () => {
  it("formats the count and picks the word", () => {
    expect(plural(1, "day")).toBe("1 day");
    expect(plural(1285, "contribution")).toBe("1,285 contributions");
    expect(plural(2, "entry", "entries")).toBe("2 entries");
  });
});

function days(counts: number[]): CalendarDay[] {
  return counts.map((count, i) => ({
    date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
    weekday: (4 + i) % 7,
    count,
    level: count > 0 ? 1 : 0,
  }));
}

describe("summarizeCalendar", () => {
  it("finds the longest run, the current run, the best day and active days", () => {
    const summary = summarizeCalendar(days([1, 2, 3, 0, 5, 0, 1, 1]));
    expect(summary).toMatchObject({ current: 2, longest: 3, active: 6 });
    expect(summary.best).toMatchObject({ date: "2026-01-05", count: 5 });
  });

  it("doesn't break the current streak on an empty today", () => {
    expect(summarizeCalendar(days([1, 1, 1, 0])).current).toBe(3);
    expect(summarizeCalendar(days([1, 1, 0, 0])).current).toBe(0);
  });

  it("handles a year with nothing in it", () => {
    expect(summarizeCalendar(days([0, 0, 0]))).toEqual({
      current: 0,
      longest: 0,
      best: null,
      active: 0,
    });
  });
});

describe("parseContributionsPage", () => {
  const cell = (date: string, id: string, level: number) =>
    `<td tabindex="0" data-ix="0" style="width: 10px" data-date="${date}" id="${id}" data-level="${level}" role="gridcell" class="ContributionCalendar-day"></td>`;
  const tip = (id: string, text: string) =>
    `<tool-tip id="tooltip-${id}" for="${id}" popover="manual" data-type="label" class="sr-only position-absolute">${text}</tool-tip>`;
  // GitHub lays the grid out row by row (all Sundays, then all Mondays), not in date order.
  const html = [
    cell("2026-10-04", "day-0-0", 0),
    cell("2026-10-11", "day-0-1", 4),
    cell("2026-10-05", "day-1-0", 1),
    cell("2026-10-12", "day-1-1", 2),
    tip("day-0-0", "No contributions on October 4th."),
    tip("day-0-1", "1,204 contributions on October 11th."),
    tip("day-1-0", "1 contribution on October 5th."),
    tip("day-1-1", "7 contributions on October 12th."),
  ].join("\n");

  it("reads each day's date, level and count, in date order, split into Sunday weeks", () => {
    const { total, weeks } = parseContributionsPage(html);
    expect(total).toBe(1212);
    expect(weeks.map((week) => week.map((day) => [day.date, day.weekday, day.count, day.level]))).toEqual([
      [["2026-10-04", 0, 0, 0], ["2026-10-05", 1, 1, 1]],
      [["2026-10-11", 0, 1204, 4], ["2026-10-12", 1, 7, 2]],
    ]);
  });

  it("fails loudly when the page no longer looks like a contribution graph", () => {
    expect(() => parseContributionsPage("<html><body>Not Found</body></html>")).toThrow();
  });
});

describe("weather helpers", () => {
  it("names WMO codes and reads wall-clock hours", () => {
    expect(describeWeather(0, false)).toBe("Clear night");
    expect(describeWeather(63)).toBe("Rain");
    expect(describeWeather(95)).toBe("Thunderstorm");
    expect(hourOf("2026-10-12T18:15")).toBe(18.25);
    expect(hourOf("")).toBeNull();
  });

  it("labels coordinates by hemisphere", () => {
    expect(formatCoordinates(12.87, 74.88)).toBe("12.87°N 74.88°E");
    expect(formatCoordinates(-33.8688, -151.2)).toBe("33.87°S 151.20°W");
  });

  it("names a zone by abbreviation where one exists, else by offset", () => {
    const summer = new Date(Date.UTC(2026, 6, 1, 12));
    expect(zoneLabel("Asia/Kolkata", summer)).toBe("IST · GMT+5:30");
    expect(zoneLabel("Europe/Berlin", summer)).toBe("CEST · GMT+2");
    expect(zoneLabel("Asia/Tokyo", summer)).toBe("GMT+9");
  });
});

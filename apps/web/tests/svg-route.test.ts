import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/svg-kit/fonts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@repo/svg-kit/fonts")>()),
  loadFonts: async () => [],
}));

vi.mock("@/lib/svg/data/posts", () => ({
  findPost: () => undefined,
  loadPostCard: async () => {
    throw new Error("not used");
  },
  loadRecentPosts: async () => ({ total: 0, posts: [] }),
}));

vi.mock("@/lib/svg/data/guestbook", () => ({
  loadGuestbook: async () => ({ total: 0, signatures: [] }),
}));

vi.mock("@/lib/svg/data/weather", async (importOriginal) => {
  const { SvgParamError } = await import("@repo/svg-kit/template");
  return {
    ...(await importOriginal<typeof import("@/lib/svg/data/weather")>()),
    loadWeather: async ({ city }: { city?: string }) => {
      if (city?.toLowerCase() === "nowhere") throw new SvgParamError(`No place called "${city}".`);
      return {
        place: "Berlin, DE",
        timeZone: "Europe/Berlin",
        temperature: 12,
        feelsLike: 10,
        humidity: 70,
        code: 3,
        isDay: true,
        sunrise: "2026-10-12T07:30",
        sunset: "2026-10-12T18:30",
      };
    },
  };
});

const calendar = vi.hoisted(() => ({ fail: false }));

vi.mock("@/lib/svg/data/github", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/svg/data/github")>()),
  loadCalendar: async () => {
    if (calendar.fail) throw new Error("GitHub GraphQL responded 503");
    return { total: 0, weeks: [] };
  },
}));

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

const { GET } = await import("@/app/svg/route");

function get(query: string) {
  return GET(new NextRequest(`http://localhost/svg?${query}`));
}

const REQUIRED_HEADERS = {
  "content-type": "image/svg+xml",
  "cache-control": "max-age=0, no-cache, no-store, must-revalidate",
  "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  "x-content-type-options": "nosniff",
};

async function expectSvg(res: Response, status: number) {
  expect(res.status).toBe(status);
  for (const [name, value] of Object.entries(REQUIRED_HEADERS)) {
    expect(res.headers.get(name)).toBe(value);
  }
  const body = await res.text();
  expect(body.startsWith("<svg")).toBe(true);
  expect(body).not.toMatch(/<script|<foreignObject|https?:\/\/(?!www\.w3\.org)/);
  return body;
}

describe("GET /svg", () => {
  beforeEach(() => {
    calendar.fail = false;
  });

  it("renders a registered template", async () => {
    await expectSvg(await get("type=calendar&theme=dark"), 200);
    await expectSvg(await get("type=banner&theme=light"), 200);
    await expectSvg(await get("type=banner&theme=dark&role=Full%20Stack%20Developer"), 200);
    await expectSvg(await get("type=heading&theme=light&n=2&title=Selected%20work"), 200);
  });

  it("sizes the heading to the circle when there is no title", async () => {
    const body = await expectSvg(await get("type=heading&theme=dark&n=3"), 200);
    expect(body).toMatch(/^<svg[^>]*width="24" height="24"/);
  });

  it("returns an error card for an unknown type", async () => {
    await expectSvg(await get("type=nope&theme=dark"), 400);
    await expectSvg(await get("theme=dark"), 400);
  });

  it("returns an error card for a missing or invalid theme", async () => {
    await expectSvg(await get("type=calendar"), 400);
    await expectSvg(await get("type=calendar&theme=blue"), 400);
  });

  it("returns an error card for bad params", async () => {
    await expectSvg(await get("type=heading&theme=dark&n=100"), 400);
    await expectSvg(await get("type=posts&theme=dark&limit=abc"), 400);
    await expectSvg(await get("type=banner&theme=dark&role=" + "x".repeat(25)), 400);
    await expectSvg(await get("type=post&theme=dark&slug=missing"), 400);
  });

  it("renders list cards with nothing in them", async () => {
    await expectSvg(await get("type=guestbook&theme=light&limit=2"), 200);
    await expectSvg(await get("type=posts&theme=dark"), 200);
  });

  it("validates options on the newer cards", async () => {
    await expectSvg(await get("type=guestbook&theme=dark&limit=7"), 400);
    await expectSvg(await get("type=local&theme=dark&units=k"), 400);
  });

  it("renders local for any place and checks how the place is given", async () => {
    await expectSvg(await get("type=local&theme=light&city=Berlin&country=de"), 200);
    await expectSvg(await get("type=local&theme=dark&lat=52.52&lon=13.4&name=Office"), 200);
    await expectSvg(await get("type=local&theme=dark&lat=52.52"), 400);
    await expectSvg(await get("type=local&theme=dark&lat=91&lon=0"), 400);
    await expectSvg(await get("type=local&theme=dark&city=Berlin&lat=1&lon=2"), 400);
    await expectSvg(await get("type=local&theme=dark&city=Berlin&country=DEU"), 400);
    await expectSvg(await get("type=local&theme=dark&country=DE"), 400);
  });

  it("answers 400, not 500, for a place that doesn't exist", async () => {
    await expectSvg(await get("type=local&theme=dark&city=Nowhere"), 400);
  });

  it("does not resolve inherited object keys as templates", async () => {
    await expectSvg(await get("type=constructor&theme=dark"), 400);
    await expectSvg(await get("type=__proto__&theme=dark"), 400);
  });

  it("returns an error card when data fails to load", async () => {
    calendar.fail = true;
    await expectSvg(await get("type=calendar&theme=dark"), 500);
  });

  it("ignores the cache-busting v param", async () => {
    await expectSvg(await get("type=calendar&theme=dark&v=7"), 200);
  });
});

import { z } from "zod";
import { formatTimeInZone, statusForHour } from "@/lib/date";
import {
  describeWeather,
  hourOf,
  loadWeather,
  type Weather,
  zoneLabel,
} from "@/lib/svg/data/weather";
import {
  Body,
  CardHeader,
  Cell,
  Figure,
  Frame,
  Grid,
  GUTTER,
  HAIRLINE,
  HEADER_HEIGHT,
  Label,
  Stats,
  STATS_HEIGHT,
  truncate,
} from "@/lib/svg/primitives";
import { CARD_WIDTH, defineTemplate, HOUR } from "@/lib/svg/template";

const CELL = 29;
const GAP = 4;
const READOUT_HEIGHT = 48 + 12 + 23;
const BODY_HEIGHT = GUTTER + READOUT_HEIGHT + 24 + CELL + 12 + 11 + GUTTER;
const SIZE = {
  width: CARD_WIDTH,
  height: 4 * HAIRLINE + HEADER_HEIGHT + BODY_HEIGHT + STATS_HEIGHT,
};

const HOUR_MARKS = [0, 6, 12, 18];

/** Coordinates to two decimals (about a kilometre) so nearby requests share a cache entry. */
const coordinate = (limit: number) =>
  z.coerce
    .number()
    .min(-limit)
    .max(limit)
    .transform((value) => Math.round(value * 100) / 100)
    .optional();

const PARAMS = z
  .object({
    city: z
      .string()
      .trim()
      .min(1)
      .max(60)
      .transform((city) => city.replace(/\s+/g, " "))
      .optional(),
    country: z
      .string()
      .trim()
      .regex(/^[a-z]{2}$/i, "Use a two-letter country code, like IN or DE.")
      .transform((code) => code.toUpperCase())
      .optional(),
    lat: coordinate(90),
    lon: coordinate(180),
    name: z.string().trim().min(1).max(32).optional(),
    units: z.enum(["c", "f"]).default("c"),
  })
  .refine(
    ({ lat, lon }) => (lat === undefined) === (lon === undefined),
    "Pass lat and lon together.",
  )
  .refine(
    ({ city, lat }) => !(city && lat !== undefined),
    "Pass a city or lat and lon, not both.",
  )
  .refine(({ city, country }) => !country || city, "country only narrows a city.");

/** The hour on the place's wall clock, with minutes as a fraction. */
function localHours(timeZone: string, now: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map(({ type, value }) => [type, value]),
  );
  return (Number(parts.hour) % 24) + Number(parts.minute) / 60;
}

function clock(stamp: string) {
  const hour = hourOf(stamp);
  if (hour === null) return "—";
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** One cell per hour of today: night, daylight, the hours the sun crosses, and now. */
function dayLevels(weather: Weather, now: number) {
  const rise = hourOf(weather.sunrise) ?? 6;
  const set = hourOf(weather.sunset) ?? 18;
  return Array.from({ length: 24 }, (_, hour) => {
    if (hour === now) return 4;
    if (hour === Math.floor(rise) || hour === Math.floor(set)) return 2;
    return hour > rise && hour < set ? 1 : 0;
  });
}

function sentence(text: string) {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

export const local = defineTemplate({
  params: PARAMS,
  size: () => SIZE,
  load: (params) => loadWeather(params),
  revalidate: HOUR / 2,
  fixtures: [
    {
      label: "Home, clear evening",
      query: {},
      data: {
        place: "Mangalore",
        timeZone: "Asia/Kolkata",
        temperature: 28,
        feelsLike: 34,
        humidity: 83,
        code: 0,
        isDay: false,
        sunrise: "2026-10-12T06:20",
        sunset: "2026-10-12T18:13",
      },
    },
    {
      label: "A city, in Fahrenheit",
      query: { city: "Reykjavik", units: "f" },
      data: {
        place: "Reykjavík, IS",
        timeZone: "Atlantic/Reykjavik",
        temperature: 34,
        feelsLike: 27,
        humidity: 88,
        code: 73,
        isDay: true,
        sunrise: "2026-10-12T08:08",
        sunset: "2026-10-12T18:18",
      },
    },
    {
      label: "Bare coordinates",
      query: { lat: "35.68", lon: "139.69" },
      data: {
        place: "35.68°N 139.69°E",
        timeZone: "Asia/Tokyo",
        temperature: 19,
        feelsLike: 19,
        humidity: 71,
        code: 61,
        isDay: true,
        sunrise: "2026-10-12T05:43",
        sunset: "2026-10-12T17:12",
      },
    },
  ],
  render: ({ params, data, theme }) => {
    const now = new Date();
    const nowHours = localHours(data.timeZone, now);
    const hour = Math.floor(nowHours);
    const unit = `°${params.units.toUpperCase()}`;
    const rise = hourOf(data.sunrise) ?? 6;
    const set = hourOf(data.sunset) ?? 18;
    const nextSun =
      nowHours < rise || nowHours >= set
        ? { label: "Sunrise", value: clock(data.sunrise) }
        : { label: "Sunset", value: clock(data.sunset) };

    return (
      <Frame theme={theme} {...SIZE}>
        <CardHeader
          theme={theme}
          label="Right now"
          meta={`${truncate(data.place, 36)} · ${zoneLabel(data.timeZone, now)}`}
        />
        <Cell
          theme={theme}
          style={{
            flexShrink: 0,
            height: BODY_HEIGHT,
            flexDirection: "column",
            padding: GUTTER,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              height: READOUT_HEIGHT,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Figure theme={theme} size={48}>
                {formatTimeInZone(data.timeZone, now)}
              </Figure>
              <Body theme={theme} lines={1}>
                {sentence(statusForHour(hour))}
              </Body>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 12,
              }}
            >
              <Figure theme={theme} size={48} tone="accent">
                {`${data.temperature}°`}
              </Figure>
              <Body theme={theme} lines={1}>
                {describeWeather(data.code, data.isDay)}
              </Body>
            </div>
          </div>
          <div style={{ display: "flex", marginTop: 24 }}>
            <Grid theme={theme} levels={[dayLevels(data, hour)]} cell={CELL} gap={GAP} />
          </div>
          <div style={{ display: "flex", marginTop: 12 }}>
            {HOUR_MARKS.map((mark) => (
              <div key={mark} style={{ display: "flex", width: 6 * (CELL + GAP) }}>
                <Label theme={theme} tone="faint">
                  {mark === 0 ? "12 AM" : mark === 12 ? "Noon" : `${mark % 12} ${mark < 12 ? "AM" : "PM"}`}
                </Label>
              </div>
            ))}
          </div>
        </Cell>
        <Stats
          theme={theme}
          items={[
            { label: "Feels like", value: `${data.feelsLike}${unit}` },
            { label: "Humidity", value: `${data.humidity}%` },
            { ...nextSun, accent: true },
          ]}
        />
      </Frame>
    );
  },
});

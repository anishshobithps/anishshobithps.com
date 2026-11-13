import { SvgParamError } from "@repo/svg-kit/template";

const TIMEOUT_MS = 5000;

interface Place {
  name: string;
  timeZone: string;
  latitude: number;
  longitude: number;
}

const HOME: Place = {
  name: "Mangalore",
  timeZone: "Asia/Kolkata",
  latitude: 12.87,
  longitude: 74.88,
};

export interface PlaceQuery {
  city?: string;
  country?: string;
  lat?: number;
  lon?: number;
  name?: string;
}

export interface Weather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  code: number;
  isDay: boolean;
  sunrise: string;
  sunset: string;
}

export type LocalWeather = Weather & { place: string; timeZone: string };

interface ForecastResponse {
  timezone: string;
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    is_day: number;
  };
  daily: { sunrise: string[]; sunset: string[] };
}

interface GeocodingResponse {
  results?: {
    name: string;
    country_code?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }[];
}

async function openMeteo<T>(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Open-Meteo ${new URL(url).pathname} responded ${res.status}`);
  return res.json() as Promise<T>;
}

async function geocode(city: string, country?: string): Promise<Place> {
  const params = new URLSearchParams({
    name: city,
    count: "1",
    language: "en",
    format: "json",
    ...(country ? { countryCode: country } : {}),
  });
  const { results } = await openMeteo<GeocodingResponse>(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
  );
  const match = results?.[0];
  if (!match) {
    throw new SvgParamError(`No place called "${city}"${country ? ` in ${country}` : ""}.`);
  }
  return {
    name: match.country_code ? `${match.name}, ${match.country_code}` : match.name,
    timeZone: match.timezone ?? "UTC",
    latitude: match.latitude,
    longitude: match.longitude,
  };
}

export function formatCoordinates(lat: number, lon: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lon).toFixed(2)}°${ew}`;
}

async function resolvePlace({ city, country, lat, lon, name }: PlaceQuery) {
  if (city) {
    const place = await geocode(city, country);
    return name ? { ...place, name } : place;
  }
  if (lat !== undefined && lon !== undefined) {
    return { name: name ?? formatCoordinates(lat, lon), latitude: lat, longitude: lon };
  }
  return name ? { ...HOME, name } : HOME;
}

export async function loadWeather(
  query: PlaceQuery & { units: "c" | "f" },
): Promise<LocalWeather> {
  const place = await resolvePlace(query);
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day",
    daily: "sunrise,sunset",
    timezone: "auto",
    forecast_days: "1",
    temperature_unit: query.units === "f" ? "fahrenheit" : "celsius",
  });
  const { timezone, current, daily } = await openMeteo<ForecastResponse>(
    `https://api.open-meteo.com/v1/forecast?${params}`,
  );
  return {
    place: place.name,
    timeZone: timezone,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    code: current.weather_code,
    isDay: current.is_day === 1,
    sunrise: daily.sunrise[0] ?? "",
    sunset: daily.sunset[0] ?? "",
  };
}

export function describeWeather(code: number, isDay = true) {
  if (code === 0) return isDay ? "Clear sky" : "Clear night";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}

export function hourOf(stamp: string) {
  const match = stamp.match(/T(\d{2}):(\d{2})/);
  return match ? Number(match[1]) + Number(match[2]) / 60 : null;
}

export function zoneLabel(timeZone: string, now: Date) {
  const name = (locale: string, style: "short" | "shortOffset") =>
    new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: style })
      .formatToParts(now)
      .find((part) => part.type === "timeZoneName")?.value ?? "";
  const offset = name("en-US", "shortOffset");
  const abbreviation = ["en-US", "en-GB", "en-IN", "en-AU"]
    .map((locale) => name(locale, "short"))
    .find((short) => short && !short.startsWith("GMT"));
  return abbreviation ? [abbreviation, offset] : [offset];
}

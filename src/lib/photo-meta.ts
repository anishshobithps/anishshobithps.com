export type PhotoExif = {
  takenAt: string | null;
  takenAtOffset: number | null;
  camera: string | null;
  lens: string | null;
  focalLength: number | null;
  focalLength35mm: number | null;
  aperture: number | null;
  exposureTime: number | null;
  iso: number | null;
};

export const EXIF_TAGS = [
  "Make",
  "Model",
  "LensModel",
  "FocalLength",
  "FocalLengthIn35mmFormat",
  "FNumber",
  "ExposureTime",
  "ISO",
  "DateTimeOriginal",
  "OffsetTimeOriginal",
  "CreateDate",
  "OffsetTime",
] as const;

export const EMPTY_EXIF: PhotoExif = {
  takenAt: null,
  takenAtOffset: null,
  camera: null,
  lens: null,
  focalLength: null,
  focalLength35mm: null,
  aperture: null,
  exposureTime: null,
  iso: null,
};

const MAKE_NAMES: Record<string, string> = {
  apple: "Apple",
  canon: "Canon",
  dji: "DJI",
  fujifilm: "Fujifilm",
  google: "Google",
  gopro: "GoPro",
  hasselblad: "Hasselblad",
  huawei: "Huawei",
  leica: "Leica",
  nikon: "Nikon",
  olympus: "Olympus",
  om: "OM System",
  oneplus: "OnePlus",
  panasonic: "Panasonic",
  pentax: "Pentax",
  ricoh: "Ricoh",
  samsung: "Samsung",
  sigma: "Sigma",
  sony: "Sony",
  xiaomi: "Xiaomi",
};

const DATE_PATTERN = /^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})/;
const OFFSET_PATTERN = /^([+-])(\d{2}):?(\d{2})$/;
const MAX_OFFSET_MINUTES = 14 * 60;
const MINUTE = 60_000;

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replaceAll("\0", "").replace(/\s+/g, " ").trim();
  return cleaned || null;
}

function positive(value: unknown): number | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return typeof candidate === "number" &&
    Number.isFinite(candidate) &&
    candidate > 0
    ? candidate
    : null;
}

function positiveInt(value: unknown): number | null {
  const n = positive(value);
  return n === null ? null : Math.round(n);
}

function trimNumber(value: number, digits = 1): string {
  return String(Number(value.toFixed(digits)));
}

export function parseExifOffset(value: unknown): number | null {
  const raw = text(value);
  if (!raw) return null;
  if (raw === "Z") return 0;
  const match = OFFSET_PATTERN.exec(raw);
  if (!match) return null;
  const [, sign, hours, minutes] = match;
  if (Number(minutes) >= 60) return null;
  const total = Number(hours) * 60 + Number(minutes);
  if (total > MAX_OFFSET_MINUTES) return null;
  return sign === "-" && total !== 0 ? -total : total;
}

export function parseExifDateTime(
  value: unknown,
  offset: unknown,
): Pick<PhotoExif, "takenAt" | "takenAtOffset"> | null {
  const raw = text(value);
  if (!raw) return null;
  const match = DATE_PATTERN.exec(raw);
  if (!match) return null;
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  if (year < 1826 || month < 1 || month > 12 || day < 1) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  const check = new Date(wall);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  const takenAtOffset = parseExifOffset(offset);
  return {
    takenAt: new Date(wall - (takenAtOffset ?? 0) * MINUTE).toISOString(),
    takenAtOffset,
  };
}

function makeName(make: string): string {
  const firstWord = make.split(/[\s,]/)[0]?.toLowerCase() ?? "";
  const known = MAKE_NAMES[firstWord];
  if (known) return known;
  return make === make.toUpperCase()
    ? make.charAt(0) + make.slice(1).toLowerCase()
    : make;
}

export function formatCamera(
  make: string | null,
  model: string | null,
): string | null {
  if (!make) return model;
  const brand = makeName(make);
  if (!model) return brand;
  const lowerModel = model.toLowerCase();
  const prefixes = [brand, make, make.split(/[\s,]/)[0] ?? ""]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  const prefix = prefixes.find((p) => {
    const next = lowerModel.charAt(p.length);
    return lowerModel.startsWith(p.toLowerCase()) && (next === "" || next === " ");
  });
  const rest = prefix ? model.slice(prefix.length).trim() : model;
  return rest ? `${brand} ${rest}` : brand;
}

export function normalizeExif(raw: Record<string, unknown>): PhotoExif {
  const date =
    parseExifDateTime(raw.DateTimeOriginal, raw.OffsetTimeOriginal) ??
    parseExifDateTime(raw.CreateDate, raw.OffsetTime);
  return {
    takenAt: date?.takenAt ?? null,
    takenAtOffset: date?.takenAtOffset ?? null,
    camera: formatCamera(text(raw.Make), text(raw.Model)),
    lens: text(raw.LensModel),
    focalLength: positive(raw.FocalLength),
    focalLength35mm: positiveInt(raw.FocalLengthIn35mmFormat),
    aperture: positive(raw.FNumber),
    exposureTime: positive(raw.ExposureTime),
    iso: positiveInt(raw.ISO),
  };
}

export function formatAperture(aperture: number): string {
  return `ƒ/${trimNumber(aperture)}`;
}

export function formatShutter(seconds: number): string {
  if (seconds >= 1) return `${trimNumber(seconds)} s`;
  const denominator = 1 / seconds;
  const nearest = Math.round(denominator);
  if (seconds < 0.25 || Math.abs(denominator - nearest) <= 0.05 * denominator) {
    return `1/${nearest} s`;
  }
  return `${trimNumber(seconds)} s`;
}

export function formatFocalLength(
  focalLength: number | null,
  focalLength35mm: number | null,
): string | null {
  const value = focalLength35mm ?? focalLength;
  return value ? `${trimNumber(value)} mm` : null;
}

function formatIso(iso: number): string {
  return `ISO ${iso}`;
}

export function exposureSummary(
  exif: Pick<
    PhotoExif,
    "focalLength" | "focalLength35mm" | "aperture" | "exposureTime" | "iso"
  >,
): string[] {
  return [
    formatFocalLength(exif.focalLength, exif.focalLength35mm),
    exif.aperture ? formatAperture(exif.aperture) : null,
    exif.exposureTime ? formatShutter(exif.exposureTime) : null,
    exif.iso ? formatIso(exif.iso) : null,
  ].filter((part): part is string => part !== null);
}

function wallClock(takenAt: string, offset: number | null): Date {
  return new Date(new Date(takenAt).getTime() + (offset ?? 0) * MINUTE);
}

const longDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

const clockTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

const monthLabel = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatTakenDate(takenAt: string, offset: number | null): string {
  return longDate.format(wallClock(takenAt, offset));
}

export function formatTakenTime(takenAt: string, offset: number | null): string {
  return clockTime.format(wallClock(takenAt, offset));
}

export function formatUtcOffset(offset: number): string {
  const sign = offset < 0 ? "−" : "+";
  const minutes = Math.abs(offset);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `UTC${sign}${hours}${rest ? `:${String(rest).padStart(2, "0")}` : ""}`;
}

export function formatMegapixels(width: number, height: number): string {
  return `${trimNumber((width * height) / 1_000_000)} MP`;
}

export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}

type Dated = { takenAt: string | null; takenAtOffset: number | null };

export function photoTitle(photo: Dated & { caption: string | null }): string {
  if (photo.caption) return photo.caption;
  if (photo.takenAt) {
    return `Photo from ${formatTakenDate(photo.takenAt, photo.takenAtOffset)}`;
  }
  return "Photo";
}

export type PhotoGroup<T> = { key: string; label: string; photos: T[] };

export function groupPhotosByMonth<T extends Dated>(photos: readonly T[]) {
  const groups = new Map<string, PhotoGroup<T>>();
  const undated: T[] = [];
  for (const photo of photos) {
    if (!photo.takenAt) {
      undated.push(photo);
      continue;
    }
    const wall = wallClock(photo.takenAt, photo.takenAtOffset);
    const key = wall.toISOString().slice(0, 7);
    const group = groups.get(key);
    if (group) group.photos.push(photo);
    else groups.set(key, { key, label: monthLabel.format(wall), photos: [photo] });
  }
  const result = [...groups.values()];
  if (undated.length > 0) {
    result.push({ key: "undated", label: "Undated", photos: undated });
  }
  return result;
}

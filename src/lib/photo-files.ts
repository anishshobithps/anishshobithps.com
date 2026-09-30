export const PHOTO_TYPES = {
  "image/jpeg": { ext: "jpg", label: "JPEG" },
  "image/heic": { ext: "heic", label: "HEIC" },
  "image/heif": { ext: "heif", label: "HEIF" },
  "image/avif": { ext: "avif", label: "AVIF" },
  "image/png": { ext: "png", label: "PNG" },
  "image/webp": { ext: "webp", label: "WebP" },
} as const;

export type PhotoType = keyof typeof PHOTO_TYPES;

export const PHOTO_TYPE_LIST = Object.keys(PHOTO_TYPES) as [
  PhotoType,
  ...PhotoType[],
];

export const PHOTO_ACCEPT = [...PHOTO_TYPE_LIST, ".heic", ".heif"].join(",");

export const PHOTO_SNIFF_BYTES = 64;
export const MAX_ORIGINAL_BYTES = 200_000_000;
export const MAX_DISPLAY_BYTES = 25_000_000;
export const DISPLAY_WIDTHS = [480, 960, 1600, 2400] as const;

export const DISPLAY_FORMATS = {
  webp: { type: "image/webp", ext: "webp" },
  jpeg: { type: "image/jpeg", ext: "jpg" },
} as const;

export type DisplayFormat = keyof typeof DISPLAY_FORMATS;

const PHOTO_ROW_REM = { base: 7, sm: 11, lg: 14 } as const;
export const photoRowHeight =
  "[--photo-row:7rem] sm:[--photo-row:11rem] lg:[--photo-row:14rem]";

const ID_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";
export const PHOTO_ID_LENGTH = 16;
export const PHOTO_ID_PATTERN = /^[0-9a-hjkmnp-tv-z]{16}$/;

const BRANDS: Record<string, PhotoType> = {
  avif: "image/avif",
  avis: "image/avif",
  heic: "image/heic",
  heix: "image/heic",
  hevc: "image/heic",
  hevx: "image/heic",
  heim: "image/heic",
  heis: "image/heic",
  hevm: "image/heic",
  hevs: "image/heic",
  mif1: "image/heif",
  mif2: "image/heif",
  msf1: "image/heif",
};

const BRAND_PRIORITY: readonly PhotoType[] = [
  "image/avif",
  "image/heic",
  "image/heif",
];

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function hasSignature(bytes: Uint8Array, signature: readonly number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}

function isoBrands(bytes: Uint8Array): string[] {
  if (bytes.length < 12 || ascii(bytes, 4, 4) !== "ftyp") return [];
  const boxSize = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  ).getUint32(0);
  const end = Math.min(boxSize || bytes.length, bytes.length);
  const brands = [ascii(bytes, 8, 4)];
  for (let offset = 16; offset + 4 <= end; offset += 4) {
    brands.push(ascii(bytes, offset, 4));
  }
  return brands;
}

export function sniffPhotoType(bytes: Uint8Array): PhotoType | null {
  if (hasSignature(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (hasSignature(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return "image/webp";
  }
  const [major, ...compatible] = isoBrands(bytes);
  if (major === undefined) return null;
  const fromMajor = BRANDS[major];
  if (fromMajor && fromMajor !== "image/heif") return fromMajor;
  const found = new Set(
    [major, ...compatible].map((brand) => BRANDS[brand]).filter(Boolean),
  );
  return BRAND_PRIORITY.find((type) => found.has(type)) ?? null;
}

export function isHeifFamily(type: PhotoType): boolean {
  return type === "image/heic" || type === "image/heif";
}

export function planDisplayWidths(sourceWidth: number): number[] {
  const width = Math.max(1, Math.round(sourceWidth));
  const widths: number[] = DISPLAY_WIDTHS.filter((w) => w < width);
  if (width <= DISPLAY_WIDTHS[DISPLAY_WIDTHS.length - 1]) widths.push(width);
  return widths;
}

export function createPhotoId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(PHOTO_ID_LENGTH));
  return Array.from(bytes, (byte) => ID_ALPHABET[byte & 31]).join("");
}

export function originalKey(id: string, type: PhotoType): string {
  return `${id}/original.${PHOTO_TYPES[type].ext}`;
}

export function displayKey(
  id: string,
  width: number,
  format: DisplayFormat,
): string {
  return `${id}/${width}w.${DISPLAY_FORMATS[format].ext}`;
}

export function joinUrl(base: string, key: string): string {
  const path = key.split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/+$/, "")}/${path}`;
}

export function buildSrcSet(
  base: string,
  id: string,
  widths: readonly number[],
  format: DisplayFormat,
): string {
  return widths
    .map((width) => `${joinUrl(base, displayKey(id, width, format))} ${width}w`)
    .join(", ");
}

function ratioOf(width: number, height: number): string {
  return (width / height).toFixed(4).replace(/\.?0+$/, "");
}

export function gridSizes(width: number, height: number): string {
  const ratio = width / height;
  const at = (rem: number) =>
    `min(100vw, ${(ratio * rem * 1.35).toFixed(1)}rem)`;
  return [
    `(min-width: 64rem) ${at(PHOTO_ROW_REM.lg)}`,
    `(min-width: 40rem) ${at(PHOTO_ROW_REM.sm)}`,
    at(PHOTO_ROW_REM.base),
  ].join(", ");
}

export function lightboxSizes(width: number, height: number): string {
  const ratio = ratioOf(width, height);
  return [
    `(min-width: 64rem) min(calc(100vw - 22rem), calc((100vh - 8rem) * ${ratio}))`,
    `min(100vw, calc((100vh - 11rem) * ${ratio}))`,
  ].join(", ");
}

export function blurBackground(
  dataUrl: string,
  width: number,
  height: number,
): string {
  const w = 640;
  const h = Math.max(1, Math.round((w * height) / width));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><filter id='b' color-interpolation-filters='sRGB'><feGaussianBlur stdDeviation='20'/><feColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/><feFlood x='0' y='0' width='100%' height='100%'/><feComposite operator='out' in='s'/><feComposite in2='SourceGraphic'/><feGaussianBlur stdDeviation='20'/></filter><image width='100%' height='100%' x='0' y='0' preserveAspectRatio='none' style='filter:url(#b)' href='${dataUrl}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const byteFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"] as const;
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${byteFormat.format(value)} ${units[unit]}`;
}

export const justifiedRows =
  "flex flex-wrap gap-px after:grow-[1000000] after:basis-0 after:bg-background after:hatch after:content-['']";

export function justifiedTile(width: number, height: number) {
  const ratio = width / height;
  return {
    flexGrow: ratio,
    flexBasis: `calc(var(--photo-row) * ${ratio.toFixed(4)})`,
    aspectRatio: `${width} / ${height}`,
  };
}

import { describe, expect, it } from "vitest";
import {
  DISPLAY_WIDTHS,
  PHOTO_ID_LENGTH,
  PHOTO_ID_PATTERN,
  blurBackground,
  buildSrcSet,
  createPhotoId,
  displayKey,
  formatBytes,
  gridSizes,
  joinUrl,
  justifiedTile,
  lightboxSizes,
  originalKey,
  planDisplayWidths,
  sniffPhotoType,
} from "@/lib/photo-files";

function bytes(...parts: (string | number[])[]): Uint8Array {
  const out: number[] = [];
  for (const part of parts) {
    if (typeof part === "string") out.push(...Array.from(part, (c) => c.charCodeAt(0)));
    else out.push(...part);
  }
  return new Uint8Array(out);
}

function ftyp(major: string, ...compatible: string[]) {
  const size = 16 + compatible.length * 4;
  return bytes([0, 0, 0, size], "ftyp", major, [0, 0, 0, 0], ...compatible);
}

describe("sniffPhotoType", () => {
  it.each([
    ["JPEG", bytes([0xff, 0xd8, 0xff, 0xe1]), "image/jpeg"],
    ["PNG", bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png"],
    ["WebP", bytes("RIFF", [0, 0, 0, 0], "WEBPVP8 "), "image/webp"],
    ["iPhone HEIC", ftyp("heic", "mif1", "heic"), "image/heic"],
    ["HEIF with a heic compatible brand", ftyp("mif1", "heic"), "image/heic"],
    ["generic HEIF", ftyp("mif1", "miaf"), "image/heif"],
    ["AVIF", ftyp("avif", "mif1", "miaf"), "image/avif"],
    ["AVIF declared through compatible brands", ftyp("mif1", "avif"), "image/avif"],
  ])("detects %s", (_, input, expected) => {
    expect(sniffPhotoType(input)).toBe(expected);
  });

  it.each([
    ["an empty buffer", new Uint8Array()],
    ["a GIF", bytes("GIF89a")],
    ["an MP4", ftyp("isom", "iso2", "mp41")],
    ["a PDF", bytes("%PDF-1.7")],
  ])("rejects %s", (_, input) => {
    expect(sniffPhotoType(input)).toBeNull();
  });

  it("ignores brands past the declared ftyp box", () => {
    const truncated = bytes([0, 0, 0, 16], "ftyp", "mif1", [0, 0, 0, 0], "heic");
    expect(sniffPhotoType(truncated)).toBe("image/heif");
  });
});

describe("planDisplayWidths", () => {
  it("uses every width below a large source", () => {
    expect(planDisplayWidths(4032)).toEqual([...DISPLAY_WIDTHS]);
  });

  it("caps at the source width instead of upscaling", () => {
    expect(planDisplayWidths(1200)).toEqual([480, 960, 1200]);
  });

  it("does not duplicate a width that matches exactly", () => {
    expect(planDisplayWidths(960)).toEqual([480, 960]);
    expect(planDisplayWidths(2400)).toEqual([480, 960, 1600, 2400]);
  });

  it("keeps a single copy for tiny images", () => {
    expect(planDisplayWidths(300)).toEqual([300]);
    expect(planDisplayWidths(0.4)).toEqual([1]);
  });
});

describe("createPhotoId", () => {
  it("produces URL and key safe ids", () => {
    const id = createPhotoId();
    expect(id).toHaveLength(PHOTO_ID_LENGTH);
    expect(id).toMatch(PHOTO_ID_PATTERN);
  });

  it("does not repeat across many calls", () => {
    const ids = new Set(Array.from({ length: 2000 }, createPhotoId));
    expect(ids.size).toBe(2000);
  });
});

describe("object keys", () => {
  it("names originals by their real format", () => {
    expect(originalKey("abc", "image/heic")).toBe("abc/original.heic");
    expect(originalKey("abc", "image/jpeg")).toBe("abc/original.jpg");
  });

  it("names web copies by width and format", () => {
    expect(displayKey("abc", 960, "webp")).toBe("abc/960w.webp");
    expect(displayKey("abc", 960, "jpeg")).toBe("abc/960w.jpg");
  });

  it("joins keys onto a base URL without doubling slashes", () => {
    expect(joinUrl("https://cdn.example.com/", "abc/960w.webp")).toBe(
      "https://cdn.example.com/abc/960w.webp",
    );
    expect(joinUrl("https://cdn.example.com/photos//", "a b/1.jpg")).toBe(
      "https://cdn.example.com/photos/a%20b/1.jpg",
    );
  });

  it("builds a srcset with width descriptors", () => {
    expect(buildSrcSet("https://cdn.example.com", "abc", [480, 960], "webp")).toBe(
      "https://cdn.example.com/abc/480w.webp 480w, https://cdn.example.com/abc/960w.webp 960w",
    );
  });
});

describe("layout helpers", () => {
  it("grows each tile in proportion to its aspect ratio", () => {
    expect(justifiedTile(3000, 2000)).toEqual({
      flexGrow: 1.5,
      flexBasis: "calc(var(--photo-row) * 1.5000)",
      aspectRatio: "3000 / 2000",
    });
  });

  it("gives the grid one size per breakpoint", () => {
    const sizes = gridSizes(4, 3).split(/, (?=\(|min)/);
    expect(sizes).toHaveLength(3);
    expect(sizes[0]).toMatch(/^\(min-width: 64rem\) min\(100vw, [\d.]+rem\)$/);
    expect(sizes[2]).toMatch(/^min\(100vw, [\d.]+rem\)$/);
  });

  it("sizes the viewer by whichever edge constrains the photo", () => {
    expect(lightboxSizes(3000, 2000)).toContain("* 1.5))");
    expect(lightboxSizes(2000, 2000)).toContain("* 1))");
  });

  it("wraps the blur placeholder in an encoded SVG", () => {
    const value = blurBackground("data:image/webp;base64,AAAA", 4, 3);
    expect(value.startsWith('url("data:image/svg+xml,')).toBe(true);
    expect(value).not.toMatch(/[<>#]/);
    expect(decodeURIComponent(value)).toContain("viewBox='0 0 640 480'");
  });
});

describe("formatBytes", () => {
  it.each([
    [512, "512 B"],
    [1_500, "1.5 KB"],
    [12_400_000, "12.4 MB"],
    [200_000_000, "200 MB"],
    [3_200_000_000, "3.2 GB"],
  ])("formats %d bytes", (input, expected) => {
    expect(formatBytes(input)).toBe(expected);
  });
});

import { describe, expect, it } from "vitest";
import { EMPTY_EXIF } from "@/lib/photo-meta";
import {
  photoDetailsSchema,
  photoIdSchema,
  photoUploadSchema,
} from "@/lib/photos-schema";

const valid = {
  filename: "IMG_4821.HEIC",
  type: "image/heic",
  bytes: 48_000_000,
  width: 4032,
  height: 3024,
  display: {
    format: "webp",
    files: [
      { width: 480, bytes: 40_000 },
      { width: 960, bytes: 140_000 },
      { width: 1600, bytes: 380_000 },
      { width: 2400, bytes: 820_000 },
    ],
  },
  blurDataUrl: "data:image/webp;base64,UklGRiIAAABXRUJQ",
  exif: { ...EMPTY_EXIF, takenAt: "2026-05-26T13:12:10.000Z", takenAtOffset: 330, iso: 80 },
};

function issues(input: unknown) {
  const result = photoUploadSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe("photoUploadSchema", () => {
  it("accepts a large HEIC original well past Cloudinary's 10 MB cap", () => {
    expect(photoUploadSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects originals over the size limit", () => {
    expect(issues({ ...valid, bytes: 250_000_000 })).toEqual([
      "Originals must be 200 MB or smaller.",
    ]);
  });

  it("rejects file types it can't store", () => {
    expect(issues({ ...valid, type: "image/gif" })).toEqual([
      "That file type isn't supported.",
    ]);
  });

  it("requires exactly the planned web copies", () => {
    expect(
      issues({ ...valid, display: { ...valid.display, files: valid.display.files.slice(1) } }),
    ).toEqual(["Web copies don't match the photo's size."]);
    expect(
      issues({
        ...valid,
        display: {
          ...valid.display,
          files: [...valid.display.files].reverse(),
        },
      }),
    ).toEqual(["Web copies don't match the photo's size."]);
  });

  it("rejects blur placeholders that aren't tiny inline images", () => {
    expect(issues({ ...valid, blurDataUrl: "https://example.com/a.jpg" })).toEqual([
      "Invalid blur placeholder.",
    ]);
    expect(
      issues({ ...valid, blurDataUrl: `data:image/webp;base64,${"A".repeat(5000)}` }),
    ).not.toEqual([]);
  });

  it("rejects datetimes without an explicit offset", () => {
    expect(
      photoUploadSchema.safeParse({
        ...valid,
        exif: { ...valid.exif, takenAt: "2026-05-26 13:12:10" },
      }).success,
    ).toBe(false);
  });
});

describe("photoDetailsSchema", () => {
  it("trims text and turns empty optional fields into null", () => {
    expect(
      photoDetailsSchema.parse({ alt: "  A street at dusk ", caption: "  ", location: "" }),
    ).toEqual({ alt: "A street at dusk", caption: null, location: null });
  });

  it("allows drafts without alt text", () => {
    expect(photoDetailsSchema.safeParse({ alt: "", caption: "", location: "" }).success).toBe(
      true,
    );
  });

  it("caps alt text length", () => {
    expect(
      photoDetailsSchema.safeParse({ alt: "a".repeat(301), caption: "", location: "" }).success,
    ).toBe(false);
  });
});

describe("photoIdSchema", () => {
  it("only accepts generated ids", () => {
    expect(photoIdSchema.safeParse("0123456789abcdef").success).toBe(true);
    expect(photoIdSchema.safeParse("../../etc/passwd").success).toBe(false);
    expect(photoIdSchema.safeParse("0123456789abcdei").success).toBe(false);
  });
});

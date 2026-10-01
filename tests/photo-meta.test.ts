import { describe, expect, it } from "vitest";
import {
  EMPTY_EXIF,
  exposureSummary,
  formatAperture,
  formatCamera,
  formatFocalLength,
  formatShutter,
  formatTakenDate,
  formatTakenTime,
  formatUtcOffset,
  groupPhotosByMonth,
  normalizeExif,
  parseExifDateTime,
  parseExifOffset,
  photoTitle,
} from "@/lib/photo-meta";

describe("parseExifOffset", () => {
  it.each([
    ["+05:30", 330],
    ["-08:00", -480],
    ["+0000", 0],
    ["-00:00", 0],
    ["Z", 0],
    ["+14:00", 840],
  ])("reads %s as %d minutes", (input, expected) => {
    expect(parseExifOffset(input)).toBe(expected);
  });

  it.each([["+15:00"], ["+05:75"], ["5:30"], [""], [undefined], [330]])(
    "rejects %o",
    (input) => {
      expect(parseExifOffset(input)).toBeNull();
    },
  );
});

describe("parseExifDateTime", () => {
  it("converts local wall time plus offset into a UTC instant", () => {
    expect(parseExifDateTime("2026:05:26 23:30:00", "+05:30")).toEqual({
      takenAt: "2026-05-26T18:00:00.000Z",
      takenAtOffset: 330,
    });
  });

  it("keeps floating times as-is when the camera wrote no offset", () => {
    expect(parseExifDateTime("2019:01:02 03:04:05", undefined)).toEqual({
      takenAt: "2019-01-02T03:04:05.000Z",
      takenAtOffset: null,
    });
  });

  it("tolerates padding, sub-second suffixes and ISO separators", () => {
    expect(parseExifDateTime(" 2024-02-29T12:00:00.123\0", "-03:00")?.takenAt).toBe(
      "2024-02-29T15:00:00.000Z",
    );
  });

  it.each([
    ["0000:00:00 00:00:00"],
    ["2023:02:29 10:00:00"],
    ["2024:13:01 10:00:00"],
    ["2024:01:01 24:00:00"],
    ["garbage"],
    [""],
  ])("rejects %s", (input) => {
    expect(parseExifDateTime(input, "+00:00")).toBeNull();
  });
});

describe("formatCamera", () => {
  it.each([
    ["Apple", "iPhone 15 Pro", "Apple iPhone 15 Pro"],
    ["Canon", "Canon EOS R5", "Canon EOS R5"],
    ["NIKON CORPORATION", "NIKON Z 6_2", "Nikon Z 6_2"],
    ["SONY", "ILCE-7M4", "Sony ILCE-7M4"],
    ["FUJIFILM", "X-T5", "Fujifilm X-T5"],
    ["LEICA CAMERA AG", "LEICA Q2", "Leica Q2"],
    ["OM Digital Solutions", "OM-1", "OM System OM-1"],
    ["Google", "Pixel 8 Pro", "Google Pixel 8 Pro"],
    ["ACMECAM", "X1", "Acmecam X1"],
    ["Apple", null, "Apple"],
    [null, "Mystery Box", "Mystery Box"],
    [null, null, null],
  ])("combines %o and %o", (make, model, expected) => {
    expect(formatCamera(make, model)).toBe(expected);
  });
});

describe("normalizeExif", () => {
  it("normalizes an iPhone HEIC's tags", () => {
    expect(
      normalizeExif({
        Make: "Apple",
        Model: "iPhone 15 Pro",
        LensModel: "iPhone 15 Pro back triple camera 6.765mm f/1.78",
        FocalLength: 6.765,
        FocalLengthIn35mmFormat: 24,
        FNumber: 1.78,
        ExposureTime: 0.008333333333333333,
        ISO: 80,
        DateTimeOriginal: "2026:05:26 18:42:10",
        OffsetTimeOriginal: "+05:30",
      }),
    ).toEqual({
      takenAt: "2026-05-26T13:12:10.000Z",
      takenAtOffset: 330,
      camera: "Apple iPhone 15 Pro",
      lens: "iPhone 15 Pro back triple camera 6.765mm f/1.78",
      focalLength: 6.765,
      focalLength35mm: 24,
      aperture: 1.78,
      exposureTime: 0.008333333333333333,
      iso: 80,
    });
  });

  it("falls back to CreateDate and reads ISO arrays", () => {
    const exif = normalizeExif({
      CreateDate: "2020:07:04 09:00:00",
      OffsetTime: "-04:00",
      ISO: [400, 400],
    });
    expect(exif.takenAt).toBe("2020-07-04T13:00:00.000Z");
    expect(exif.iso).toBe(400);
  });

  it("drops junk values instead of storing them", () => {
    expect(
      normalizeExif({
        Make: "   ",
        FNumber: 0,
        ExposureTime: -1,
        ISO: "80",
        FocalLength: Number.NaN,
        DateTimeOriginal: "0000:00:00 00:00:00",
      }),
    ).toEqual(EMPTY_EXIF);
  });
});

describe("exposure formatting", () => {
  it.each([
    [1 / 400, "1/400 s"],
    [1 / 3, "1/3 s"],
    [0.5, "1/2 s"],
    [0.3, "0.3 s"],
    [0.4, "0.4 s"],
    [1, "1 s"],
    [2.5, "2.5 s"],
    [30, "30 s"],
  ])("formats a %d second shutter", (seconds, expected) => {
    expect(formatShutter(seconds)).toBe(expected);
  });

  it("rounds apertures to one decimal", () => {
    expect(formatAperture(1.78)).toBe("ƒ/1.8");
    expect(formatAperture(2)).toBe("ƒ/2");
    expect(formatAperture(5.6)).toBe("ƒ/5.6");
  });

  it("prefers the 35mm-equivalent focal length", () => {
    expect(formatFocalLength(6.765, 24)).toBe("24 mm");
    expect(formatFocalLength(50, null)).toBe("50 mm");
    expect(formatFocalLength(null, null)).toBeNull();
  });

  it("summarizes only the settings that exist", () => {
    expect(
      exposureSummary({
        focalLength: 6.765,
        focalLength35mm: 24,
        aperture: 1.78,
        exposureTime: 1 / 120,
        iso: 80,
      }),
    ).toEqual(["24 mm", "ƒ/1.8", "1/120 s", "ISO 80"]);
    expect(
      exposureSummary({
        focalLength: null,
        focalLength35mm: null,
        aperture: null,
        exposureTime: null,
        iso: 200,
      }),
    ).toEqual(["ISO 200"]);
  });
});

describe("dates in the photo's own time zone", () => {
  const lateNightInIndia = "2026-05-26T18:00:00.000Z";

  it("shows the date where the photo was taken, not in UTC", () => {
    expect(formatTakenDate(lateNightInIndia, 330)).toBe("May 26, 2026");
    expect(formatTakenDate("2026-05-26T20:00:00.000Z", 330)).toBe("May 27, 2026");
    expect(formatTakenTime(lateNightInIndia, 330).replace(/\s/g, " ")).toBe("11:30 PM");
  });

  it("formats offsets with a real minus sign", () => {
    expect(formatUtcOffset(330)).toBe("UTC+5:30");
    expect(formatUtcOffset(-480)).toBe("UTC−8");
    expect(formatUtcOffset(0)).toBe("UTC+0");
  });
});

describe("groupPhotosByMonth", () => {
  const photo = (id: string, takenAt: string | null, takenAtOffset: number | null = 0) => ({
    id,
    takenAt,
    takenAtOffset,
  });

  it("groups in order and files undated photos last", () => {
    const groups = groupPhotosByMonth([
      photo("a", "2026-05-20T10:00:00.000Z"),
      photo("x", null),
      photo("b", "2026-05-02T10:00:00.000Z"),
      photo("c", "2026-04-30T10:00:00.000Z"),
    ]);
    expect(groups.map((g) => [g.label, g.photos.map((p) => p.id)])).toEqual([
      ["May 2026", ["a", "b"]],
      ["April 2026", ["c"]],
      ["Undated", ["x"]],
    ]);
  });

  it("uses the local month when an offset pushes across a boundary", () => {
    const [group] = groupPhotosByMonth([photo("a", "2026-04-30T20:00:00.000Z", 330)]);
    expect(group?.label).toBe("May 2026");
  });
});

describe("photoTitle", () => {
  it("prefers the caption, then the date", () => {
    expect(photoTitle({ caption: "Monsoon", takenAt: null, takenAtOffset: null })).toBe("Monsoon");
    expect(
      photoTitle({ caption: null, takenAt: "2026-05-26T10:00:00.000Z", takenAtOffset: 0 }),
    ).toBe("Photo from May 26, 2026");
    expect(photoTitle({ caption: null, takenAt: null, takenAtOffset: null })).toBe("Photo");
  });
});

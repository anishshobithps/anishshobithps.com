import { z } from "zod";
import {
  MAX_DISPLAY_BYTES,
  MAX_ORIGINAL_BYTES,
  PHOTO_ID_PATTERN,
  PHOTO_TYPE_LIST,
  formatBytes,
  planDisplayWidths,
} from "@/lib/photo-files";

export const PHOTO_LIMITS = {
  alt: 300,
  caption: 500,
  location: 120,
  filename: 255,
  camera: 120,
  lens: 160,
  blurDataUrl: 4096,
  dimension: 65_535,
} as const;

const nullableNumber = (max: number) =>
  z.number().positive().max(max).nullable();

const photoExifSchema = z.object({
  takenAt: z.iso.datetime({ offset: true }).nullable(),
  takenAtOffset: z.number().int().min(-840).max(840).nullable(),
  camera: z.string().trim().max(PHOTO_LIMITS.camera).nullable(),
  lens: z.string().trim().max(PHOTO_LIMITS.lens).nullable(),
  focalLength: nullableNumber(10_000),
  focalLength35mm: z.number().int().positive().max(10_000).nullable(),
  aperture: nullableNumber(256),
  exposureTime: nullableNumber(86_400),
  iso: z.number().int().positive().max(10_000_000).nullable(),
});

const dimension = z.number().int().positive().max(PHOTO_LIMITS.dimension);

export const photoUploadSchema = z
  .object({
    filename: z.string().trim().min(1).max(PHOTO_LIMITS.filename),
    type: z.enum(PHOTO_TYPE_LIST, { message: "That file type isn't supported." }),
    bytes: z
      .number()
      .int()
      .positive()
      .max(
        MAX_ORIGINAL_BYTES,
        `Originals must be ${formatBytes(MAX_ORIGINAL_BYTES)} or smaller.`,
      ),
    width: dimension,
    height: dimension,
    display: z.object({
      format: z.enum(["webp", "jpeg"]),
      files: z
        .array(
          z.object({
            width: dimension,
            bytes: z.number().int().positive().max(MAX_DISPLAY_BYTES),
          }),
        )
        .min(1),
    }),
    blurDataUrl: z
      .string()
      .max(PHOTO_LIMITS.blurDataUrl)
      .regex(/^data:image\/(?:jpeg|webp|png);base64,[A-Za-z0-9+/]+=*$/, {
        message: "Invalid blur placeholder.",
      }),
    exif: photoExifSchema,
  })
  .refine(
    (input) => {
      const expected = planDisplayWidths(input.width);
      const actual = input.display.files.map((file) => file.width);
      return (
        expected.length === actual.length &&
        expected.every((width, index) => width === actual[index])
      );
    },
    { message: "Web copies don't match the photo's size.", path: ["display"] },
  );

export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .transform((value) => (value === "" ? null : value));

export const photoDetailsSchema = z.object({
  alt: z
    .string()
    .trim()
    .max(PHOTO_LIMITS.alt, `Alt text must be ${PHOTO_LIMITS.alt} characters or fewer.`),
  caption: optionalText(PHOTO_LIMITS.caption, "Caption"),
  location: optionalText(PHOTO_LIMITS.location, "Location"),
});

export const photoIdSchema = z.string().regex(PHOTO_ID_PATTERN, "Unknown photo.");

export const ALT_REQUIRED_MESSAGE = "Add alt text before publishing.";

import { z } from "zod";
import { isHttpUrl } from "@/lib/links-schema";

export const PROJECT_LIMITS = {
  title: 256,
  description: 2000,
  highlight: 300,
  highlights: 12,
  url: 512,
} as const;

const optionalUrl = z
  .string()
  .trim()
  .max(PROJECT_LIMITS.url, `URL must be ${PROJECT_LIMITS.url} characters or fewer.`)
  .refine((v) => v === "" || isHttpUrl(v), {
    message: "Enter a valid http(s):// URL.",
  })
  .transform((v) => (v === "" ? null : v))
  .nullable();

export const projectInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(PROJECT_LIMITS.title, `Title must be ${PROJECT_LIMITS.title} characters or fewer.`),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(
      PROJECT_LIMITS.description,
      `Description must be ${PROJECT_LIMITS.description} characters or fewer.`,
    ),
  highlights: z
    .array(
      z
        .string()
        .trim()
        .max(
          PROJECT_LIMITS.highlight,
          `Each highlight must be ${PROJECT_LIMITS.highlight} characters or fewer.`,
        ),
    )
    .max(PROJECT_LIMITS.highlights, `Too many highlights (max ${PROJECT_LIMITS.highlights}).`)
    .transform((values) => values.filter((v) => v !== "")),
  live: optionalUrl,
  github: optionalUrl,
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

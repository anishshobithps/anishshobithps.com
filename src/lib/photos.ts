import { siteConfig } from "@/lib/config";
import { db } from "@/lib/db";
import {
  DISPLAY_FORMATS,
  buildSrcSet,
  displayKey,
  joinUrl,
  type DisplayFormat,
} from "@/lib/photo-files";
import type { PhotoExif } from "@/lib/photo-meta";
import { publicPhotoBase } from "@/lib/photo-storage";
import { safeQuery } from "@/lib/safe-query";
import { photos } from "@/lib/schema";
import { desc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const PHOTOS_CACHE_TAG = "published-photos";

export function photoPageUrl(id: string): string {
  return `${siteConfig.baseUrl}/photos?photo=${id}`;
}

export type PhotoMedia = {
  src: string;
  srcSet: string;
  thumb: string;
  ogImage: { url: string; width: number; height: number; type: string };
};

export type PublicPhoto = PhotoExif &
  PhotoMedia & {
    id: string;
    alt: string;
    caption: string | null;
    location: string | null;
    width: number;
    height: number;
    blurDataUrl: string;
  };

type MediaSource = {
  id: string;
  width: number;
  height: number;
  displayFormat: DisplayFormat;
  displayWidths: number[];
};

function widestUpTo(widths: readonly number[], limit: number): number {
  return widths.reduce(
    (best, width) => (width <= limit && width > best ? width : best),
    widths[0] ?? 0,
  );
}

export function photoMedia(photo: MediaSource, base: string): PhotoMedia {
  const widths = [...photo.displayWidths].sort((a, b) => a - b);
  const url = (width: number) =>
    joinUrl(base, displayKey(photo.id, width, photo.displayFormat));
  const ogWidth = widestUpTo(widths, 1600);
  return {
    src: url(widestUpTo(widths, 1600)),
    srcSet: buildSrcSet(base, photo.id, widths, photo.displayFormat),
    thumb: url(widths[0] ?? photo.width),
    ogImage: {
      url: url(ogWidth),
      width: ogWidth,
      height: Math.round((ogWidth * photo.height) / photo.width),
      type: DISPLAY_FORMATS[photo.displayFormat].type,
    },
  };
}

export const exifColumns = {
  takenAt: photos.takenAt,
  takenAtOffset: photos.takenAtOffset,
  camera: photos.camera,
  lens: photos.lens,
  focalLength: photos.focalLength,
  focalLength35mm: photos.focalLength35mm,
  aperture: photos.aperture,
  exposureTime: photos.exposureTime,
  iso: photos.iso,
};

export const photoOrder = [
  sql`${photos.takenAt} desc nulls last`,
  desc(photos.createdAt),
];

const loadPublishedPhotos = unstable_cache(
  async (): Promise<PublicPhoto[]> => {
    const rows = await db
      .select({
        id: photos.id,
        alt: photos.alt,
        caption: photos.caption,
        location: photos.location,
        width: photos.width,
        height: photos.height,
        displayFormat: photos.displayFormat,
        displayWidths: photos.displayWidths,
        blurDataUrl: photos.blurDataUrl,
        ...exifColumns,
      })
      .from(photos)
      .where(eq(photos.status, "published"))
      .orderBy(...photoOrder);

    if (rows.length === 0) return [];
    const base = publicPhotoBase();

    return rows.map(({ displayFormat, displayWidths, takenAt, ...row }) => ({
      ...row,
      takenAt: takenAt?.toISOString() ?? null,
      ...photoMedia({ ...row, displayFormat, displayWidths }, base),
    }));
  },
  ["published-photos"],
  { revalidate: 3600, tags: [PHOTOS_CACHE_TAG] },
);

export function getPublishedPhotos(): Promise<PublicPhoto[]> {
  return safeQuery("getPublishedPhotos", loadPublishedPhotos, []);
}

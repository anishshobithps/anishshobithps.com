"use server";

import type { ActionResult } from "@/lib/action-result";
import { adminMutation } from "@/lib/admin-action";
import { assertAdmin } from "@/lib/assert-admin";
import { db } from "@/lib/db";
import { features } from "@/lib/features";
import {
  DISPLAY_FORMATS,
  PHOTO_TYPES,
  createPhotoId,
  displayKey,
  originalKey,
  type DisplayFormat,
  type PhotoType,
} from "@/lib/photo-files";
import type { PhotoExif } from "@/lib/photo-meta";
import {
  PhotoStorageError,
  deleteObjects,
  headObject,
  missingPhotoStorageEnv,
  presignDownload,
  presignUpload,
  publicPhotoBase,
  type PhotoBucket,
  type PresignedUpload,
} from "@/lib/photo-storage";
import {
  PHOTOS_CACHE_TAG,
  exifColumns,
  photoMedia,
  photoOrder,
} from "@/lib/photos";
import {
  ALT_REQUIRED_MESSAGE,
  photoDetailsSchema,
  photoIdSchema,
  photoUploadSchema,
} from "@/lib/photos-schema";
import { safeQuery } from "@/lib/safe-query";
import { photos } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";

type PhotoStatus = (typeof photos.$inferSelect)["status"];

export type AdminPhoto = PhotoExif & {
  id: string;
  status: PhotoStatus;
  alt: string;
  caption: string | null;
  location: string | null;
  originalName: string;
  originalType: string;
  originalBytes: number;
  width: number;
  height: number;
  thumb: string | null;
  blurDataUrl: string;
  createdAt: string;
  publishedAt: string | null;
};

type PhotoUploadTicket = {
  id: string;
  original: PresignedUpload;
  display: (PresignedUpload & { width: number })[];
};

type TicketResult =
  | { success: true; ticket: PhotoUploadTicket }
  | { success: false; error: string };

type LinkResult = { success: true; url: string } | { success: false; error: string };

type StoredPhoto = {
  id: string;
  originalType: string;
  displayFormat: DisplayFormat;
  displayWidths: number[];
};

function assertEnabled() {
  if (!features.photos) throw new Error("Photos are disabled.");
}

function isPhotoType(value: string): value is PhotoType {
  return value in PHOTO_TYPES;
}

function storedObjects(photo: StoredPhoto) {
  const objects: { bucket: PhotoBucket; key: string }[] = photo.displayWidths.map(
    (width) => ({
      bucket: "public",
      key: displayKey(photo.id, width, photo.displayFormat),
    }),
  );
  if (isPhotoType(photo.originalType)) {
    objects.unshift({
      bucket: "originals",
      key: originalKey(photo.id, photo.originalType),
    });
  }
  return objects;
}

function failureMessage(error: unknown, fallback: string): string {
  return error instanceof PhotoStorageError ? error.message : fallback;
}

function revalidatePhotos() {
  revalidatePath("/photos");
  revalidatePath("/admin/photos");
  updateTag(PHOTOS_CACHE_TAG);
}

function parseId(raw: unknown): string | null {
  const parsed = photoIdSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

async function findPhoto(id: string) {
  const [row] = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
  return row;
}

export async function getAdminPhotos(): Promise<AdminPhoto[]> {
  assertEnabled();
  await assertAdmin();
  return safeQuery("getAdminPhotos", loadAdminPhotos, []);
}

async function loadAdminPhotos(): Promise<AdminPhoto[]> {
  const rows = await db
    .select({
      id: photos.id,
      status: photos.status,
      alt: photos.alt,
      caption: photos.caption,
      location: photos.location,
      originalName: photos.originalName,
      originalType: photos.originalType,
      originalBytes: photos.originalBytes,
      width: photos.width,
      height: photos.height,
      displayFormat: photos.displayFormat,
      displayWidths: photos.displayWidths,
      blurDataUrl: photos.blurDataUrl,
      createdAt: photos.createdAt,
      publishedAt: photos.publishedAt,
      ...exifColumns,
    })
    .from(photos)
    .orderBy(...photoOrder);

  const base = missingPhotoStorageEnv().length === 0 ? publicPhotoBase() : null;

  return rows.map(
    ({ displayFormat, displayWidths, takenAt, createdAt, publishedAt, ...row }) => ({
      ...row,
      takenAt: takenAt?.toISOString() ?? null,
      createdAt: createdAt.toISOString(),
      publishedAt: publishedAt?.toISOString() ?? null,
      thumb: base
        ? photoMedia({ ...row, displayFormat, displayWidths }, base).thumb
        : null,
    }),
  );
}

export async function beginPhotoUpload(raw: unknown): Promise<TicketResult> {
  try {
    assertEnabled();
    await assertAdmin();
    const parsed = photoUploadSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid upload.",
      };
    }
    const input = parsed.data;
    const id = createPhotoId();
    const displayType = DISPLAY_FORMATS[input.display.format].type;

    const [original, ...display] = await Promise.all([
      presignUpload("originals", originalKey(id, input.type), {
        contentType: input.type,
        contentLength: input.bytes,
      }),
      ...input.display.files.map((file) =>
        presignUpload("public", displayKey(id, file.width, input.display.format), {
          contentType: displayType,
          contentLength: file.bytes,
        }),
      ),
    ]);

    await db.insert(photos).values({
      id,
      status: "uploading",
      originalName: input.filename,
      originalType: input.type,
      originalBytes: input.bytes,
      width: input.width,
      height: input.height,
      displayFormat: input.display.format,
      displayWidths: input.display.files.map((file) => file.width),
      blurDataUrl: input.blurDataUrl,
      ...input.exif,
      takenAt: input.exif.takenAt ? new Date(input.exif.takenAt) : null,
    });

    return {
      success: true,
      ticket: {
        id,
        original: original!,
        display: display.map((upload, index) => ({
          ...upload,
          width: input.display.files[index]!.width,
        })),
      },
    };
  } catch (error) {
    console.error("beginPhotoUpload failed:", error);
    return { success: false, error: failureMessage(error, "Failed to start the upload.") };
  }
}

export async function completePhotoUpload(rawId: unknown): Promise<ActionResult> {
  return adminMutation(
    "finish the upload",
    async () => {
      assertEnabled();
      const id = parseId(rawId);
      if (!id) return "Unknown photo.";
      const photo = await findPhoto(id);
      if (!photo) return "That upload no longer exists.";
      if (photo.status !== "uploading") return;

      const objects = storedObjects(photo);
      try {
        const stored = await Promise.all(
          objects.map(({ bucket, key }) => headObject(bucket, key)),
        );
        const original = stored[0];
        const intact =
          stored.every(Boolean) && original?.size === photo.originalBytes;
        if (!intact) {
          await deleteObjects(objects);
          await db.delete(photos).where(eq(photos.id, id));
          return "Some files didn't reach storage intact. Upload the photo again.";
        }
      } catch (error) {
        return failureMessage(error, "Couldn't verify the upload. Try again.");
      }

      await db
        .update(photos)
        .set({ status: "draft", updatedAt: new Date() })
        .where(and(eq(photos.id, id), eq(photos.status, "uploading")));
    },
    revalidatePhotos,
  );
}

export async function updatePhotoDetails(
  rawId: unknown,
  raw: unknown,
): Promise<ActionResult> {
  return adminMutation(
    "save the photo",
    async () => {
      assertEnabled();
      const id = parseId(rawId);
      if (!id) return "Unknown photo.";
      const parsed = photoDetailsSchema.safeParse(raw);
      if (!parsed.success) {
        return parsed.error.issues[0]?.message ?? "Invalid details.";
      }
      const photo = await findPhoto(id);
      if (!photo) return "That photo no longer exists.";
      if (photo.status === "published" && parsed.data.alt === "") {
        return "Published photos need alt text. Unpublish it first to clear it.";
      }
      await db
        .update(photos)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(photos.id, id));
    },
    revalidatePhotos,
  );
}

export async function setPhotoPublished(
  rawId: unknown,
  published: boolean,
): Promise<ActionResult> {
  return adminMutation(
    published ? "publish the photo" : "unpublish the photo",
    async () => {
      assertEnabled();
      const id = parseId(rawId);
      if (!id) return "Unknown photo.";
      const photo = await findPhoto(id);
      if (!photo) return "That photo no longer exists.";
      if (photo.status === "uploading") return "That photo is still uploading.";
      if (published && photo.alt.trim() === "") return ALT_REQUIRED_MESSAGE;

      await db
        .update(photos)
        .set({
          status: published ? "published" : "draft",
          publishedAt: published ? (photo.publishedAt ?? new Date()) : photo.publishedAt,
          updatedAt: new Date(),
        })
        .where(eq(photos.id, id));
    },
    revalidatePhotos,
  );
}

export async function deletePhoto(rawId: unknown): Promise<ActionResult> {
  return adminMutation(
    "delete the photo",
    async () => {
      assertEnabled();
      const id = parseId(rawId);
      if (!id) return "Unknown photo.";
      const photo = await findPhoto(id);
      if (!photo) return;
      try {
        await deleteObjects(storedObjects(photo));
      } catch (error) {
        return failureMessage(error, "Couldn't remove the stored files. Nothing was deleted.");
      }
      await db.delete(photos).where(eq(photos.id, id));
    },
    revalidatePhotos,
  );
}

export async function getOriginalDownloadUrl(rawId: unknown): Promise<LinkResult> {
  try {
    assertEnabled();
    await assertAdmin();
    const id = parseId(rawId);
    if (!id) return { success: false, error: "Unknown photo." };
    const photo = await findPhoto(id);
    if (!photo || !isPhotoType(photo.originalType)) {
      return { success: false, error: "That photo no longer exists." };
    }
    const url = await presignDownload(
      originalKey(photo.id, photo.originalType),
      photo.originalName,
    );
    return { success: true, url };
  } catch (error) {
    console.error("getOriginalDownloadUrl failed:", error);
    return { success: false, error: failureMessage(error, "Couldn't prepare the download.") };
  }
}

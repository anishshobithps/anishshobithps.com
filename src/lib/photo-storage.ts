import { AwsClient } from "aws4fetch";
import { joinUrl } from "@/lib/photo-files";

const PHOTO_STORAGE_ENV = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_ORIGINALS_BUCKET",
  "R2_PUBLIC_BUCKET",
  "R2_PUBLIC_URL",
] as const;

export type PhotoBucket = "originals" | "public";

type StorageConfig = {
  endpoint: string;
  buckets: Record<PhotoBucket, string>;
  publicUrl: string;
  client: AwsClient;
};

const UPLOAD_TTL_SECONDS = 15 * 60;
const DOWNLOAD_TTL_SECONDS = 5 * 60;
const IMMUTABLE = "public, max-age=31536000, immutable";

export class PhotoStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoStorageError";
  }
}

export function missingPhotoStorageEnv(): string[] {
  return PHOTO_STORAGE_ENV.filter((name) => !process.env[name]?.trim());
}

let cached: StorageConfig | undefined;

function storage(): StorageConfig {
  if (cached) return cached;
  const missing = missingPhotoStorageEnv();
  if (missing.length > 0) {
    throw new PhotoStorageError(
      `Photo storage is not configured. Missing: ${missing.join(", ")}.`,
    );
  }
  const env = (name: (typeof PHOTO_STORAGE_ENV)[number]) =>
    process.env[name]!.trim();
  cached = {
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    buckets: {
      originals: env("R2_ORIGINALS_BUCKET"),
      public: env("R2_PUBLIC_BUCKET"),
    },
    publicUrl: env("R2_PUBLIC_URL"),
    client: new AwsClient({
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
      service: "s3",
      region: "auto",
      retries: 3,
    }),
  };
  return cached;
}

function objectUrl(bucket: PhotoBucket, key: string): URL {
  const { endpoint, buckets } = storage();
  return new URL(joinUrl(`${endpoint}/${encodeURIComponent(buckets[bucket])}`, key));
}

export function publicPhotoBase(): string {
  return storage().publicUrl;
}

export type PresignedUpload = {
  key: string;
  url: string;
  headers: Record<string, string>;
};

export async function presignUpload(
  bucket: PhotoBucket,
  key: string,
  { contentType, contentLength }: { contentType: string; contentLength: number },
): Promise<PresignedUpload> {
  const url = objectUrl(bucket, key);
  url.searchParams.set("X-Amz-Expires", String(UPLOAD_TTL_SECONDS));
  const headers: Record<string, string> = { "Content-Type": contentType };
  if (bucket === "public") headers["Cache-Control"] = IMMUTABLE;
  const signed = await storage().client.sign(url.toString(), {
    method: "PUT",
    headers: { ...headers, "Content-Length": String(contentLength) },
    aws: { signQuery: true, allHeaders: true },
  });
  return { key, url: signed.url, headers };
}

function contentDisposition(filename: string): string {
  const fallback = filename.replace(/[^\x20-\x7e]|["\\]/g, "_");
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function presignDownload(key: string, filename: string): Promise<string> {
  const url = objectUrl("originals", key);
  url.searchParams.set("X-Amz-Expires", String(DOWNLOAD_TTL_SECONDS));
  url.searchParams.set("response-content-disposition", contentDisposition(filename));
  const signed = await storage().client.sign(url.toString(), {
    method: "GET",
    aws: { signQuery: true },
  });
  return signed.url;
}

export type StoredObject = { size: number; contentType: string | null };

export async function headObject(
  bucket: PhotoBucket,
  key: string,
): Promise<StoredObject | null> {
  const response = await storage().client.fetch(objectUrl(bucket, key).toString(), {
    method: "HEAD",
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new PhotoStorageError(`Storage HEAD failed (${response.status}) for ${key}.`);
  }
  return {
    size: Number(response.headers.get("content-length") ?? -1),
    contentType: response.headers.get("content-type"),
  };
}

export async function deleteObjects(
  objects: readonly { bucket: PhotoBucket; key: string }[],
): Promise<void> {
  const results = await Promise.allSettled(
    objects.map(async ({ bucket, key }) => {
      const response = await storage().client.fetch(
        objectUrl(bucket, key).toString(),
        { method: "DELETE" },
      );
      if (!response.ok && response.status !== 404) {
        throw new PhotoStorageError(
          `Storage DELETE failed (${response.status}) for ${key}.`,
        );
      }
    }),
  );
  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length > 0) {
    throw new PhotoStorageError(
      `Could not delete ${failed.length} of ${objects.length} stored files.`,
    );
  }
}

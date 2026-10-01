import {
  DISPLAY_FORMATS,
  MAX_ORIGINAL_BYTES,
  PHOTO_SNIFF_BYTES,
  PHOTO_TYPES,
  formatBytes,
  isHeifFamily,
  planDisplayWidths,
  sniffPhotoType,
  type DisplayFormat,
  type PhotoType,
} from "@/lib/photo-files";
import { EMPTY_EXIF, EXIF_TAGS, normalizeExif, type PhotoExif } from "@/lib/photo-meta";
import type { PhotoUploadInput } from "@/lib/photos-schema";

type Canvas = OffscreenCanvas | HTMLCanvasElement;
type Context2D = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

export type PreparedPhoto = {
  input: PhotoUploadInput;
  original: File;
  display: { width: number; blob: Blob }[];
  preview: Blob;
};

class PhotoPrepareError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoPrepareError";
  }
}

const QUALITY: Record<DisplayFormat, number> = { webp: 0.82, jpeg: 0.86 };
const BLUR_EDGE = 16;

let displayFormat: Promise<DisplayFormat> | undefined;

function createCanvas(width: number, height: number): Canvas {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function context(canvas: Canvas): Context2D {
  const ctx = canvas.getContext("2d", { alpha: false, colorSpace: "srgb" }) as Context2D | null;
  if (!ctx) throw new PhotoPrepareError("This browser can't render images.");
  return ctx;
}

async function encode(canvas: Canvas, type: string, quality: number) {
  const blob =
    "convertToBlob" in canvas
      ? await canvas.convertToBlob({ type, quality })
      : await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, type, quality),
        );
  if (!blob) throw new PhotoPrepareError("Couldn't encode a web copy.");
  return blob;
}

function release(canvas: Canvas) {
  canvas.width = 0;
  canvas.height = 0;
}

function pickDisplayFormat(): Promise<DisplayFormat> {
  displayFormat ??= Promise.resolve()
    .then(() => {
      const probe = createCanvas(1, 1);
      context(probe).fillRect(0, 0, 1, 1);
      return encode(probe, DISPLAY_FORMATS.webp.type, 0.8);
    })
    .then((blob): DisplayFormat =>
      blob.type === DISPLAY_FORMATS.webp.type ? "webp" : "jpeg",
    )
    .catch((): DisplayFormat => "jpeg");
  return displayFormat;
}

function draw(source: CanvasImageSource, width: number, height: number): Canvas {
  const canvas = createCanvas(width, height);
  const ctx = context(canvas);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

function resample(
  source: CanvasImageSource,
  from: { width: number; height: number },
  width: number,
  height: number,
): Canvas {
  let current = source;
  let size = from;
  const steps: Canvas[] = [];
  while (size.width > width * 2) {
    const next = {
      width: Math.round(size.width / 2),
      height: Math.round(size.height / 2),
    };
    const canvas = draw(current, next.width, next.height);
    steps.push(canvas);
    current = canvas;
    size = next;
  }
  const result = draw(current, width, height);
  steps.forEach(release);
  return result;
}

async function readExif(file: File): Promise<PhotoExif> {
  try {
    const { default: exifr } = await import("exifr");
    const raw = await exifr.parse(file, {
      pick: [...EXIF_TAGS],
      reviveValues: false,
      translateValues: false,
      xmp: false,
      icc: false,
      iptc: false,
      jfif: false,
      ihdr: false,
    });
    return raw ? normalizeExif(raw) : EMPTY_EXIF;
  } catch {
    return EMPTY_EXIF;
  }
}

async function decode(file: File, type: PhotoType): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    if (!isHeifFamily(type)) {
      throw new PhotoPrepareError(
        `This browser can't decode ${PHOTO_TYPES[type].label} files.`,
      );
    }
  }
  try {
    const { heicTo } = await import("heic-to/next");
    return await heicTo({ blob: file, type: "bitmap" });
  } catch {
    throw new PhotoPrepareError(
      "Couldn't decode this HEIC file. Try exporting it from Photos first.",
    );
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  if (file.size > MAX_ORIGINAL_BYTES) {
    throw new PhotoPrepareError(
      `This file is ${formatBytes(file.size)}. Originals can be up to ${formatBytes(MAX_ORIGINAL_BYTES)}.`,
    );
  }
  const head = new Uint8Array(await file.slice(0, PHOTO_SNIFF_BYTES).arrayBuffer());
  const type = sniffPhotoType(head);
  if (!type) {
    throw new PhotoPrepareError(
      "Not a supported photo. Use HEIC, JPEG, PNG, WebP or AVIF.",
    );
  }

  const [exif, bitmap, format] = await Promise.all([
    readExif(file),
    decode(file, type),
    pickDisplayFormat(),
  ]);

  const canvases: Canvas[] = [];
  try {
    const { width, height } = bitmap;
    const mime = DISPLAY_FORMATS[format].type;
    const widths = planDisplayWidths(width).sort((a, b) => b - a);
    const display: PreparedPhoto["display"] = [];

    let source: CanvasImageSource = bitmap;
    let size = { width, height };
    for (const target of widths) {
      const targetHeight = Math.max(1, Math.round((height * target) / width));
      const canvas = resample(source, size, target, targetHeight);
      canvases.push(canvas);
      display.unshift({ width: target, blob: await encode(canvas, mime, QUALITY[format]) });
      source = canvas;
      size = { width: target, height: targetHeight };
    }

    const landscape = width >= height;
    const blurWidth = landscape ? BLUR_EDGE : Math.max(1, Math.round((BLUR_EDGE * width) / height));
    const blurHeight = landscape ? Math.max(1, Math.round((BLUR_EDGE * height) / width)) : BLUR_EDGE;
    const blurCanvas = draw(source, blurWidth, blurHeight);
    canvases.push(blurCanvas);
    const blurDataUrl = await blobToDataUrl(await encode(blurCanvas, mime, 0.6));

    return {
      original: file,
      display,
      preview: display[0]!.blob,
      input: {
        filename: file.name,
        type,
        bytes: file.size,
        width,
        height,
        display: {
          format,
          files: display.map(({ width: w, blob }) => ({ width: w, bytes: blob.size })),
        },
        blurDataUrl,
        exif,
      },
    };
  } finally {
    bitmap.close();
    canvases.forEach(release);
  }
}

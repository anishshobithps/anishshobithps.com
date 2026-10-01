"use client";

import {
  beginPhotoUpload,
  completePhotoUpload,
  deletePhoto,
} from "@/app/admin/photos/actions";
import { preparePhoto } from "@/app/admin/photos/prepare-photo";
import { putObject } from "@/app/admin/photos/put-object";
import {
  ArrowClockwiseIcon,
  CheckCircleIcon,
  ImageIcon,
  UploadSimpleIcon,
  WarningIcon,
  XIcon,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Text,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { MAX_ORIGINAL_BYTES, PHOTO_ACCEPT, formatBytes } from "@/lib/photo-files";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

type Stage =
  | "queued"
  | "preparing"
  | "uploading"
  | "verifying"
  | "done"
  | "failed"
  | "cancelled";

type UploadItem = {
  key: string;
  file: File;
  stage: Stage;
  progress: number;
  error: string | null;
  preview: string | null;
};

const ACTIVE: ReadonlySet<Stage> = new Set(["preparing", "uploading", "verifying"]);
const FINISHED: ReadonlySet<Stage> = new Set(["done", "cancelled"]);
const PROGRESS_INTERVAL_MS = 120;

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function messageOf(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Something went wrong. Try again.";
}

function stageLabel(item: UploadItem): string {
  switch (item.stage) {
    case "queued":
      return "Waiting";
    case "preparing":
      return "Reading EXIF and rendering web copies…";
    case "uploading":
      return `Uploading ${Math.round(item.progress * 100)}%`;
    case "verifying":
      return "Verifying with storage…";
    case "done":
      return "Saved as a draft";
    case "cancelled":
      return "Cancelled";
    case "failed":
      return item.error ?? "Upload failed";
  }
}

export function PhotoUploader({ onUploaded }: { onUploaded: () => void }) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const queue = useRef<string[]>([]);
  const files = useRef(new Map<string, File>());
  const controllers = useRef(new Map<string, AbortController>());
  const running = useRef(false);

  const patch = useCallback((key: string, next: Partial<UploadItem>) => {
    setItems((list) =>
      list.map((item) => (item.key === key ? { ...item, ...next } : item)),
    );
  }, []);

  const setPreview = useCallback((key: string, preview: string) => {
    setItems((list) =>
      list.map((item) => {
        if (item.key !== key) return item;
        if (item.preview) URL.revokeObjectURL(item.preview);
        return { ...item, preview };
      }),
    );
  }, []);

  const processItem = useCallback(
    async (key: string) => {
      const file = files.current.get(key);
      if (!file) return;
      const controller = new AbortController();
      controllers.current.set(key, controller);
      let photoId: string | null = null;
      try {
        patch(key, { stage: "preparing", progress: 0, error: null });
        const prepared = await preparePhoto(file);
        controller.signal.throwIfAborted();
        setPreview(key, URL.createObjectURL(prepared.preview));

        const begun = await beginPhotoUpload(prepared.input);
        if (!begun.success) throw new Error(begun.error);
        photoId = begun.ticket.id;
        controller.signal.throwIfAborted();

        const parts = [
          { target: begun.ticket.original, blob: prepared.original as Blob },
          ...begun.ticket.display.map((target) => ({
            target,
            blob: prepared.display.find((copy) => copy.width === target.width)!.blob,
          })),
        ];
        const total = parts.reduce((sum, part) => sum + part.blob.size, 0);
        const loaded = parts.map(() => 0);
        let painted = 0;
        patch(key, { stage: "uploading" });

        await Promise.all(
          parts.map((part, index) =>
            putObject(part.target, part.blob, {
              signal: controller.signal,
              onProgress: (bytes) => {
                loaded[index] = bytes;
                const now = performance.now();
                if (now - painted < PROGRESS_INTERVAL_MS) return;
                painted = now;
                const sent = loaded.reduce((sum, n) => sum + n, 0);
                patch(key, { progress: Math.min(1, sent / total) });
              },
            }),
          ),
        );

        patch(key, { stage: "verifying", progress: 1 });
        const completed = await completePhotoUpload(photoId);
        if (!completed.success) throw new Error(completed.error);
        photoId = null;
        patch(key, { stage: "done" });
        onUploaded();
      } catch (error) {
        if (photoId) void deletePhoto(photoId);
        patch(
          key,
          isAbort(error)
            ? { stage: "cancelled", error: null }
            : { stage: "failed", error: messageOf(error) },
        );
      } finally {
        controllers.current.delete(key);
      }
    },
    [onUploaded, patch, setPreview],
  );

  const drain = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    try {
      for (let key = queue.current.shift(); key; key = queue.current.shift()) {
        await processItem(key);
      }
    } finally {
      running.current = false;
    }
  }, [processItem]);

  const enqueue = useCallback(
    (selected: Iterable<File>) => {
      const added: UploadItem[] = Array.from(selected, (file) => ({
        key: crypto.randomUUID(),
        file,
        stage: "queued",
        progress: 0,
        error: null,
        preview: null,
      }));
      if (added.length === 0) return;
      for (const item of added) {
        files.current.set(item.key, item.file);
        queue.current.push(item.key);
      }
      setItems((list) => [...list, ...added]);
      void drain();
    },
    [drain],
  );

  function cancel(item: UploadItem) {
    const queued = queue.current.indexOf(item.key);
    if (queued !== -1) {
      queue.current.splice(queued, 1);
      patch(item.key, { stage: "cancelled" });
      return;
    }
    controllers.current.get(item.key)?.abort();
  }

  function retry(item: UploadItem) {
    patch(item.key, { stage: "queued", progress: 0, error: null });
    queue.current.push(item.key);
    void drain();
  }

  function dismiss(item: UploadItem) {
    if (item.preview) URL.revokeObjectURL(item.preview);
    files.current.delete(item.key);
    setItems((list) => list.filter((entry) => entry.key !== item.key));
  }

  function clearFinished() {
    for (const item of items) {
      if (FINISHED.has(item.stage)) dismiss(item);
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) enqueue(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    enqueue(event.dataTransfer.files);
  }

  const busy = items.some((item) => ACTIVE.has(item.stage) || item.stage === "queued");
  const done = items.filter((item) => item.stage === "done").length;
  const failed = items.filter((item) => item.stage === "failed").length;
  const hasFinished = items.some((item) => FINISHED.has(item.stage));
  const summary = busy
    ? `Uploading ${done + 1} of ${items.filter((item) => item.stage !== "cancelled").length}`
    : items.length > 0
      ? [
          `${done} uploaded`,
          failed > 0 ? `${failed} failed` : null,
        ]
          .filter(Boolean)
          .join(", ")
      : "";

  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  useEffect(() => {
    const active = controllers.current;
    return () => active.forEach((controller) => controller.abort());
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <label
        data-dragging={dragging || undefined}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDragging(false);
          }
        }}
        onDrop={handleDrop}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center transition-colors hover:bg-muted/40 has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 data-dragging:border-(--brand) data-dragging:bg-(--brand)/5"
      >
        <input
          type="file"
          multiple
          accept={PHOTO_ACCEPT}
          onChange={handleChange}
          className="sr-only"
        />
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground"
        >
          <UploadSimpleIcon className="size-5" />
        </span>
        <span className="flex flex-col items-center gap-1">
          <TypographySmall className="leading-normal">
            Drop photos here or{" "}
            <Text as="span" variant="none" className="underline underline-offset-4">
              browse
            </Text>
          </TypographySmall>
          <TypographyMuted as="span" className="max-w-md text-xs text-pretty">
            HEIC, JPEG, PNG, WebP or AVIF, up to {formatBytes(MAX_ORIGINAL_BYTES)} each.
            Originals stay private and untouched. Web copies are resized here and
            carry no location data.
          </TypographyMuted>
        </span>
      </label>

      {items.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-2">
            <TypographyMuted role="status" className="text-xs tabular-nums">
              {summary}
            </TypographyMuted>
            {hasFinished && (
              <Button type="button" size="xs" variant="ghost" onClick={clearFinished}>
                Clear finished
              </Button>
            )}
          </div>
          <ul role="list" className="divide-y">
            {items.map((item) => (
              <UploadRow
                key={item.key}
                item={item}
                onCancel={() => cancel(item)}
                onRetry={() => retry(item)}
                onDismiss={() => dismiss(item)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function UploadRow({
  item,
  onCancel,
  onRetry,
  onDismiss,
}: {
  item: UploadItem;
  onCancel: () => void;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const active = ACTIVE.has(item.stage);
  const percent = Math.round(item.progress * 100);
  const determinate = item.stage === "uploading";

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
        {item.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.preview} alt="" className="size-full object-cover" />
        ) : (
          <ImageIcon aria-hidden="true" className="size-4" />
        )}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <TypographySmall className="min-w-0 leading-normal wrap-break-word">
            {item.file.name}
          </TypographySmall>
          <TypographyMuted as="span" className="shrink-0 text-xs tabular-nums">
            {formatBytes(item.file.size)}
          </TypographyMuted>
        </div>
        {(active || item.stage === "queued") && (
          <div
            role="progressbar"
            aria-label={`Upload progress for ${item.file.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={determinate ? percent : undefined}
            aria-valuetext={stageLabel(item)}
            className="h-1 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full rounded-full bg-(--brand) transition-[width] duration-150 ease-out",
                !determinate && "w-1/3 motion-safe:animate-pulse",
                item.stage === "queued" && "w-0",
              )}
              style={determinate ? { width: `${percent}%` } : undefined}
            />
          </div>
        )}
        <TypographyMuted
          as="span"
          className={cn(
            "flex items-center gap-1.5 text-xs tabular-nums",
            item.stage === "failed" && "text-destructive",
          )}
        >
          {item.stage === "done" && (
            <CheckCircleIcon aria-hidden="true" className="size-3.5 text-(--brand-text)" />
          )}
          {item.stage === "failed" && (
            <WarningIcon aria-hidden="true" className="size-3.5 shrink-0" />
          )}
          {(item.stage === "preparing" || item.stage === "verifying") && (
            <Spinner aria-hidden="true" className="size-3.5" />
          )}
          {stageLabel(item)}
        </TypographyMuted>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {item.stage === "failed" && (
          <Button type="button" size="icon-sm" variant="ghost" onClick={onRetry} aria-label={`Retry ${item.file.name}`}>
            <ArrowClockwiseIcon aria-hidden="true" />
          </Button>
        )}
        {(item.stage === "queued" || item.stage === "preparing" || item.stage === "uploading") && (
          <Button type="button" size="icon-sm" variant="ghost" onClick={onCancel} aria-label={`Cancel ${item.file.name}`}>
            <XIcon aria-hidden="true" />
          </Button>
        )}
        {(item.stage === "done" || item.stage === "failed" || item.stage === "cancelled") && (
          <Button type="button" size="icon-sm" variant="ghost" onClick={onDismiss} aria-label={`Dismiss ${item.file.name}`}>
            <XIcon aria-hidden="true" />
          </Button>
        )}
      </div>
    </li>
  );
}

"use client";

import {
  CalendarIcon,
  CaretLeftIcon,
  CaretRightIcon,
  InfoIcon,
  MapPinIcon,
  XIcon,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heading,
  SectionLabel,
  Text,
  TypographyMuted,
} from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { blurBackground, lightboxSizes } from "@/lib/photo-files";
import {
  exposureSummary,
  formatAperture,
  formatDimensions,
  formatFocalLength,
  formatMegapixels,
  formatShutter,
  formatTakenDate,
  formatTakenTime,
  formatUtcOffset,
  photoTitle,
} from "@/lib/photo-meta";
import type { PublicPhoto } from "@/lib/photos";
import { padIndex } from "@/lib/text";
import { parseAsString, useQueryState } from "nuqs";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { preload } from "react-dom";

const photoParam = parseAsString.withOptions({
  scroll: false,
  history: "replace",
});

const SWIPE_DISTANCE = 48;

function focusTile(root: HTMLElement | null, id: string) {
  const tile = root?.querySelector<HTMLElement>(
    `a[data-photo-id="${CSS.escape(id)}"]`,
  );
  tile?.focus({ preventScroll: true });
  tile?.scrollIntoView({ block: "nearest" });
}

export function PhotoViewer({
  photos,
  children,
}: {
  photos: PublicPhoto[];
  children: ReactNode;
}) {
  const [photoId, setPhotoId] = useQueryState("photo", photoParam);
  const pushed = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const index = photoId ? photos.findIndex((p) => p.id === photoId) : -1;
  const [shownIndex, setShownIndex] = useState(index);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  if (index !== -1 && index !== shownIndex) setShownIndex(index);
  if (photoId === null && dismissedId !== null) setDismissedId(null);
  const open = index !== -1 && photoId !== dismissedId;
  const shown = photos[shownIndex];

  useEffect(() => {
    if (photoId === null) pushed.current = false;
    else if (index === -1) void setPhotoId(null);
  }, [photoId, index, setPhotoId]);

  const navigate = useCallback(
    (delta: -1 | 1) => {
      const target = photos[index + delta];
      if (target) void setPhotoId(target.id);
    },
    [photos, index, setPhotoId],
  );

  const close = useCallback(() => {
    setDismissedId(photoId);
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
      return;
    }
    void setPhotoId(null);
  }, [photoId, setPhotoId]);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const tile = (event.target as Element).closest<HTMLAnchorElement>(
      "a[data-photo-id]",
    );
    const id = tile?.dataset.photoId;
    if (!id) return;
    event.preventDefault();
    pushed.current = true;
    setDismissedId(null);
    void setPhotoId(id, { history: "push" });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigate(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      navigate(1);
    }
  }

  return (
    <div ref={root} onClick={handleClick}>
      {children}
      <Dialog
        open={open}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        {shown && (
          <DialogPortal>
            <DialogOverlay className="bg-background" />
            <DialogPrimitive.Content
              onKeyDown={handleKeyDown}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                focusTile(root.current, shown.id);
              }}
              className="fixed inset-0 z-50 grid grid-rows-[auto_minmax(0,1fr)_auto_auto] outline-none duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_minmax(0,1fr)]"
            >
              <ViewerBody
                photo={shown}
                index={shownIndex}
                total={photos.length}
                previous={photos[shownIndex - 1]}
                next={photos[shownIndex + 1]}
                onNavigate={navigate}
              />
            </DialogPrimitive.Content>
          </DialogPortal>
        )}
      </Dialog>
    </div>
  );
}

function ViewerBody({
  photo,
  index,
  total,
  previous,
  next,
  onNavigate,
}: {
  photo: PublicPhoto;
  index: number;
  total: number;
  previous: PublicPhoto | undefined;
  next: PublicPhoto | undefined;
  onNavigate: (delta: -1 | 1) => void;
}) {
  const [openedId] = useState(photo.id);
  const [infoOpen, setInfoOpen] = useState(false);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const swipe = useRef<{ x: number; y: number; pointer: number } | null>(null);

  const loaded = loadedId === photo.id;
  const failed = failedId === photo.id;
  const ratio = photo.width / photo.height;
  const summary = exposureSummary(photo);
  const announcement =
    photo.id === openedId ? "" : `Photo ${index + 1} of ${total}. ${photo.alt}`;

  useEffect(() => {
    for (const neighbor of [previous, next]) {
      if (!neighbor) continue;
      preload(neighbor.src, {
        as: "image",
        imageSrcSet: neighbor.srcSet,
        imageSizes: lightboxSizes(neighbor.width, neighbor.height),
        fetchPriority: "low",
      });
    }
  }, [previous, next]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return;
    swipe.current = { x: event.clientX, y: event.clientY, pointer: event.pointerId };
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = swipe.current;
    swipe.current = null;
    if (!start || start.pointer !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    onNavigate(dx < 0 ? 1 : -1);
  }

  const stepButton = (delta: -1 | 1, className?: string) => {
    const target = delta === -1 ? previous : next;
    const Icon = delta === -1 ? CaretLeftIcon : CaretRightIcon;
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => onNavigate(delta)}
        disabled={!target}
        aria-label={delta === -1 ? "Previous photo" : "Next photo"}
        aria-keyshortcuts={delta === -1 ? "ArrowLeft" : "ArrowRight"}
        className={cn("rounded-full pointer-coarse:size-11", className)}
      >
        <Icon aria-hidden="true" />
      </Button>
    );
  };

  return (
    <>
      <header className="flex h-14 items-center justify-between gap-3 border-b border-line px-4 sm:px-6 lg:col-span-2">
        <SectionLabel pixel className="tabular-nums">
          No.{padIndex(index + 1)} / {padIndex(total)}
        </SectionLabel>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setInfoOpen((open) => !open)}
            aria-label="Photo details"
            aria-expanded={infoOpen}
            aria-controls="photo-details"
            className="rounded-full pointer-coarse:size-11 lg:hidden"
          >
            <InfoIcon aria-hidden="true" />
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Close photo"
              className="rounded-full pointer-coarse:size-11"
            >
              <XIcon aria-hidden="true" />
            </Button>
          </DialogClose>
        </div>
      </header>

      <div
        className="relative min-h-0 touch-pan-y lg:col-start-1 lg:row-start-2"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          swipe.current = null;
        }}
      >
        <div className="absolute inset-0 grid place-items-center p-3 [container-type:size] sm:p-6 lg:px-20">
          <div
            className="relative overflow-hidden rounded-sm bg-muted bg-size-[100%_100%] outline -outline-offset-1 outline-black/10 dark:outline-white/10"
            style={{
              width: `min(100cqw, calc(100cqh * ${ratio.toFixed(4)}))`,
              aspectRatio: `${photo.width} / ${photo.height}`,
              backgroundImage: blurBackground(
                photo.blurDataUrl,
                photo.width,
                photo.height,
              ),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`${photo.id}:${attempt}`}
              src={photo.src}
              srcSet={photo.srcSet}
              sizes={lightboxSizes(photo.width, photo.height)}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              decoding="async"
              fetchPriority="high"
              draggable={false}
              onLoad={() => setLoadedId(photo.id)}
              onError={() => setFailedId(photo.id)}
              data-loaded={loaded || undefined}
              className="size-full object-cover opacity-0 transition-opacity duration-300 ease-out data-loaded:opacity-100"
            />
            {failed && !loaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 p-4 text-center">
                <TypographyMuted>
                  This photo didn&apos;t load. Check your connection and try again.
                </TypographyMuted>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFailedId(null);
                    setAttempt((n) => n + 1);
                  }}
                >
                  Try again
                </Button>
              </div>
            )}
          </div>
        </div>
        {stepButton(-1, "absolute top-1/2 left-5 -translate-y-1/2 max-lg:hidden")}
        {stepButton(1, "absolute top-1/2 right-5 -translate-y-1/2 max-lg:hidden")}
      </div>

      <aside
        id="photo-details"
        aria-label="Photo details"
        data-open={infoOpen || undefined}
        className="max-h-[45dvh] overflow-y-auto border-t border-line max-lg:hidden max-lg:data-open:block lg:col-start-2 lg:row-start-2 lg:max-h-none lg:border-t-0 lg:border-l"
      >
        <PhotoDetails photo={photo} index={index} total={total} />
      </aside>

      <footer className="flex items-center gap-3 border-t border-line px-4 py-3 lg:hidden">
        {stepButton(-1)}
        <TypographyMuted className="min-w-0 flex-1 truncate text-center font-mono text-xs">
          {summary.length > 0 ? summary.join("  ") : (photo.camera ?? "")}
        </TypographyMuted>
        {stepButton(1)}
      </footer>

      <Text role="status" variant="none" className="sr-only">
        {announcement}
      </Text>
    </>
  );
}

type Spec = { label: string; value: string | null; wide?: boolean };

function PhotoDetails({
  photo,
  index,
  total,
}: {
  photo: PublicPhoto;
  index: number;
  total: number;
}) {
  const specs: Spec[] = [
    { label: "Camera", value: photo.camera, wide: true },
    { label: "Lens", value: photo.lens, wide: true },
    {
      label: "Focal length",
      value: formatFocalLength(photo.focalLength, photo.focalLength35mm),
    },
    {
      label: "Aperture",
      value: photo.aperture ? formatAperture(photo.aperture) : null,
    },
    {
      label: "Shutter",
      value: photo.exposureTime ? formatShutter(photo.exposureTime) : null,
    },
    { label: "ISO", value: photo.iso ? String(photo.iso) : null },
    {
      label: "Resolution",
      value: `${formatDimensions(photo.width, photo.height)}, ${formatMegapixels(photo.width, photo.height)}`,
      wide: true,
    },
  ];
  const visible = specs.filter((spec) => spec.value);

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-6">
      <div className="flex flex-col gap-3">
        <DialogTitle asChild>
          <Heading as="h2" level="h4" className="text-pretty">
            {photoTitle(photo)}
          </Heading>
        </DialogTitle>
        <DialogDescription className="sr-only">
          Photo {index + 1} of {total}
        </DialogDescription>
        {(photo.takenAt || photo.location) && (
          <ul role="list" className="flex flex-col gap-1.5">
            {photo.takenAt && (
              <li className="flex items-start gap-2">
                <CalendarIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <TypographyMuted asChild>
                  <time dateTime={photo.takenAt}>
                    {formatTakenDate(photo.takenAt, photo.takenAtOffset)},{" "}
                    {formatTakenTime(photo.takenAt, photo.takenAtOffset)}
                    {photo.takenAtOffset !== null &&
                      ` (${formatUtcOffset(photo.takenAtOffset)})`}
                  </time>
                </TypographyMuted>
              </li>
            )}
            {photo.location && (
              <li className="flex items-start gap-2">
                <MapPinIcon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <TypographyMuted>{photo.location}</TypographyMuted>
              </li>
            )}
          </ul>
        )}
      </div>

      {visible.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-5">
          {visible.map((spec) => (
            <div
              key={spec.label}
              className={cn("flex min-w-0 flex-col gap-1", spec.wide && "col-span-2")}
            >
              <Text
                as="dt"
                variant="none"
                className="font-mono text-[11px] leading-none tracking-widest text-muted-foreground uppercase"
              >
                {spec.label}
              </Text>
              <Text
                as="dd"
                variant="none"
                className="font-mono text-sm tabular-nums wrap-break-word"
              >
                {spec.value}
              </Text>
            </div>
          ))}
        </dl>
      )}

      <TypographyMuted className="font-mono text-xs">
        {"// read from the original file. location data never leaves it."}
      </TypographyMuted>
    </div>
  );
}

"use client";

import {
  deletePhoto,
  getAdminPhotos,
  getOriginalDownloadUrl,
  setPhotoPublished,
  updatePhotoDetails,
  type AdminPhoto,
} from "@/app/admin/photos/actions";
import { PhotoUploader } from "@/app/admin/photos/uploader";
import {
  DownloadIcon,
  ImageIcon,
  PencilIcon,
  TrashIcon,
  WarningIcon,
} from "@/components/shared/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Text,
  TypographyInlineCode,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography";
import { useActionMutation } from "@/hooks/use-action-mutation";
import { cn } from "@/lib/cn";
import { blurBackground, formatBytes } from "@/lib/photo-files";
import { exposureSummary, formatTakenDate } from "@/lib/photo-meta";
import { PHOTO_LIMITS } from "@/lib/photos-schema";
import { queryKeys } from "@/lib/query-keys";
import { toastError } from "@/lib/toast";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const STALLED_AFTER_MS = 30 * 60_000;

const detailsFormSchema = z.object({
  alt: z
    .string()
    .trim()
    .max(PHOTO_LIMITS.alt, `Alt text must be ${PHOTO_LIMITS.alt} characters or fewer.`),
  caption: z
    .string()
    .trim()
    .max(PHOTO_LIMITS.caption, `Caption must be ${PHOTO_LIMITS.caption} characters or fewer.`),
  location: z
    .string()
    .trim()
    .max(PHOTO_LIMITS.location, `Location must be ${PHOTO_LIMITS.location} characters or fewer.`),
});

type DetailsValues = z.input<typeof detailsFormSchema>;

function isStalled(photo: AdminPhoto) {
  return (
    photo.status === "uploading" &&
    Date.now() - new Date(photo.createdAt).getTime() > STALLED_AFTER_MS
  );
}

function displayName(photo: AdminPhoto) {
  return photo.caption ?? photo.originalName;
}

function Thumb({ photo, className }: { photo: AdminPhoto; className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted bg-cover text-muted-foreground",
        className,
      )}
      style={{ backgroundImage: blurBackground(photo.blurDataUrl, photo.width, photo.height) }}
    >
      {photo.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.thumb} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
      ) : (
        <ImageIcon aria-hidden="true" className="size-4" />
      )}
    </span>
  );
}

function StatusBadges({ photo }: { photo: AdminPhoto }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {photo.status === "uploading" ? (
        <Badge variant="outline">{isStalled(photo) ? "Interrupted" : "Uploading"}</Badge>
      ) : photo.status === "draft" ? (
        <Badge variant="outline">Draft</Badge>
      ) : (
        <Badge variant="secondary">Published</Badge>
      )}
      {photo.status !== "uploading" && photo.alt.trim() === "" && (
        <Badge variant="outline" className="border-destructive/40 text-destructive">
          <WarningIcon aria-hidden="true" />
          Needs alt text
        </Badge>
      )}
    </span>
  );
}

function StorageSetup({ missing }: { missing: string[] }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WarningIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Storage isn&apos;t connected</EmptyTitle>
        <EmptyDescription>
          Uploads go straight from this browser to Cloudflare R2. Add these to{" "}
          <TypographyInlineCode>.env.local</TypographyInlineCode> and restart the
          dev server. The README&apos;s Photos section walks through the buckets and
          CORS rules.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <ul role="list" className="flex flex-wrap justify-center gap-1.5">
          {missing.map((name) => (
            <li key={name}>
              <TypographyInlineCode>{name}</TypographyInlineCode>
            </li>
          ))}
        </ul>
      </EmptyContent>
    </Empty>
  );
}

function DetailsDialog({
  photo,
  onClose,
}: {
  photo: AdminPhoto | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={photo !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {photo && <DetailsForm key={photo.id} photo={photo} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function DetailsForm({ photo, onDone }: { photo: AdminPhoto; onDone: () => void }) {
  const form = useForm<DetailsValues>({
    resolver: standardSchemaResolver(detailsFormSchema),
    defaultValues: {
      alt: photo.alt,
      caption: photo.caption ?? "",
      location: photo.location ?? "",
    },
    mode: "onSubmit",
  });

  const save = useActionMutation({
    action: (values: DetailsValues) => updatePhotoDetails(photo.id, values),
    successMessage: "Photo saved.",
    invalidate: [queryKeys.admin.photos],
    onDone,
  });

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <Thumb photo={photo} className="size-12" />
          <div className="flex min-w-0 flex-col gap-1 text-left">
            <DialogTitle>Edit photo</DialogTitle>
            <DialogDescription className="wrap-break-word">
              {photo.originalName}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit((values) => save.mutate(values))}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="alt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alt text</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    className="resize-none"
                    placeholder="A rain-soaked street at dusk, lit by a single shop sign"
                    disabled={save.isPending}
                  />
                </FormControl>
                <FormDescription>
                  Describe what&apos;s in the photo for people who can&apos;t see it.
                  Required before publishing.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="caption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Caption
                  <Text as="span" variant="none" className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </Text>
                </FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} className="resize-none" disabled={save.isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Location
                  <Text as="span" variant="none" className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </Text>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="off"
                    placeholder="Mangaluru, India"
                    disabled={save.isPending}
                  />
                </FormControl>
                <FormDescription>
                  Shown as written. GPS data from the file is never published.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending} aria-busy={save.isPending}>
              {save.isPending && <Spinner data-icon="inline-start" aria-hidden="true" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

export function PhotosPanel({ missingEnv }: { missingEnv: string[] }) {
  const queryClient = useQueryClient();
  const { data: photos = [] } = useQuery({
    queryKey: queryKeys.admin.photos,
    queryFn: getAdminPhotos,
  });
  const [editing, setEditing] = useState<AdminPhoto | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const publish = useActionMutation({
    action: ({ id, published }: { id: string; published: boolean }) =>
      setPhotoPublished(id, published),
    successMessage: ({ published }) => (published ? "Photo published." : "Photo unpublished."),
    invalidate: [queryKeys.admin.photos],
  });

  const remove = useActionMutation({
    action: (id: string) => deletePhoto(id),
    successMessage: "Photo deleted.",
    invalidate: [queryKeys.admin.photos],
  });

  const pendingId = publish.isPending
    ? publish.variables.id
    : remove.isPending
      ? remove.variables
      : null;

  async function download(photo: AdminPhoto) {
    setDownloading(photo.id);
    try {
      const result = await getOriginalDownloadUrl(photo.id);
      if (!result.success) {
        toastError(result.error);
        return;
      }
      window.location.assign(result.url);
    } finally {
      setDownloading(null);
    }
  }

  const published = photos.filter((photo) => photo.status === "published").length;
  const drafts = photos.filter((photo) => photo.status === "draft").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-0.5">
        <TypographySmall className="font-semibold">Photos</TypographySmall>
        <TypographyMuted role="status" aria-live="polite" className="text-xs tabular-nums">
          {published} published, {drafts} {drafts === 1 ? "draft" : "drafts"}. Newest shot first,
          the same order as the site.
        </TypographyMuted>
      </div>

      {missingEnv.length > 0 ? (
        <StorageSetup missing={missingEnv} />
      ) : (
        <PhotoUploader
          onUploaded={() =>
            void queryClient.invalidateQueries({ queryKey: queryKeys.admin.photos })
          }
        />
      )}

      {photos.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No photos yet</EmptyTitle>
            <EmptyDescription>
              Uploads land as drafts. Add alt text, then flip them to published.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead className="hidden md:table-cell">Taken</TableHead>
                <TableHead className="w-24 text-center">Published</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {photos.map((photo) => {
                const busy = pendingId === photo.id;
                const uploading = photo.status === "uploading";
                const summary = exposureSummary(photo);
                return (
                  <TableRow
                    key={photo.id}
                    aria-busy={busy || undefined}
                    className={cn("transition-opacity", busy && "pointer-events-none opacity-50")}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Thumb photo={photo} className="size-12" />
                        <div className="flex min-w-0 flex-col gap-1">
                          <TypographySmall className="max-w-xs leading-snug wrap-break-word whitespace-normal">
                            {displayName(photo)}
                          </TypographySmall>
                          <TypographyMuted className="text-xs whitespace-normal">
                            {[photo.camera, summary.join(" "), formatBytes(photo.originalBytes)]
                              .filter(Boolean)
                              .join(", ")}
                          </TypographyMuted>
                          <StatusBadges photo={photo} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden py-3 md:table-cell">
                      <TypographyMuted className="text-xs whitespace-nowrap tabular-nums">
                        {photo.takenAt
                          ? formatTakenDate(photo.takenAt, photo.takenAtOffset)
                          : "No date"}
                      </TypographyMuted>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Switch
                        checked={photo.status === "published"}
                        disabled={uploading || busy}
                        onCheckedChange={(checked) =>
                          publish.mutate({ id: photo.id, published: checked })
                        }
                        aria-label={`Published: ${displayName(photo)}`}
                      />
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <ButtonGroup className="justify-end">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-8"
                          onClick={() => setEditing(photo)}
                          disabled={uploading}
                          aria-label={`Edit ${displayName(photo)}`}
                        >
                          <PencilIcon className="size-3.5" aria-hidden="true" />
                        </Button>
                        <ButtonGroupSeparator />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-8"
                          onClick={() => void download(photo)}
                          disabled={uploading || downloading === photo.id}
                          aria-label={`Download original of ${displayName(photo)}`}
                        >
                          {downloading === photo.id ? (
                            <Spinner aria-hidden="true" className="size-3.5" />
                          ) : (
                            <DownloadIcon className="size-3.5" aria-hidden="true" />
                          )}
                        </Button>
                        <ButtonGroupSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              disabled={busy || (uploading && !isStalled(photo))}
                              aria-label={`Delete ${displayName(photo)}`}
                            >
                              <TrashIcon className="size-3.5" aria-hidden="true" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This removes the original and every web copy from storage,
                                and takes it off the site. It can&apos;t be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep it</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => remove.mutate(photo.id)}
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Delete photo
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <DetailsDialog photo={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

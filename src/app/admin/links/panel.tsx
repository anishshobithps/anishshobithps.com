"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createLink,
  updateLink,
  toggleLinkEnabled,
  deleteLink,
  type AdminLink,
} from "@/app/admin/links/actions";
import {
  formatPath,
  linkFormSchema,
  type LinkFormValues,
} from "@/lib/links-schema";
import { slugify } from "@/lib/text";
import { siteConfig } from "@/lib/config";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ImageIcon,
  ArrowSquareOutIcon,
} from "@/components/shared/icons";
import { cn } from "@/lib/cn";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";

const emptyValues: LinkFormValues = {
  target: "",
  title: "",
  description: "",
  ogEnabled: false,
  ogImage: "",
  permanent: false,
  enabled: true,
  primary: { tag: "", slug: "" },
  aliases: [],
};

function toFormValues(link: AdminLink): LinkFormValues {
  return {
    target: link.target,
    title: link.title ?? "",
    description: link.description ?? "",
    ogEnabled: link.ogEnabled,
    ogImage: link.ogImage ?? "",
    permanent: link.permanent,
    enabled: link.enabled,
    primary: { ...link.primary },
    aliases: link.aliases.map((a) => ({ ...a })),
  };
}

function pathLabel(pair: { tag: string; slug: string }): string {
  const slug = pair.slug.trim();
  const tag = pair.tag.trim();
  if (!slug) return "…";
  return tag ? `${tag}/${slug}` : slug;
}

function LinkForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: {
  defaultValues: LinkFormValues;
  onSubmit: (values: LinkFormValues) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const form = useForm<LinkFormValues>({
    resolver: standardSchemaResolver(linkFormSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "aliases",
  });
  const values = form.watch();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://… or mailto:you@example.com"
                  disabled={submitting}
                />
              </FormControl>
              <FormDescription>
                Where visitors are sent. Supports http(s) and mailto.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-1.5">
          <Label>Primary path</Label>
          <div className="flex items-start gap-2">
            <FormField
              control={form.control}
              name="primary.tag"
              render={({ field }) => (
                <FormItem className="w-36">
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(slugify(e.target.value))}
                      placeholder="tag"
                      aria-label="Tag (optional)"
                      className="font-mono text-sm"
                      disabled={submitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <TypographyMuted className="self-center font-mono text-sm">
              /
            </TypographyMuted>
            <FormField
              control={form.control}
              name="primary.slug"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(slugify(e.target.value))}
                      placeholder="short-url"
                      aria-label="Slug (required)"
                      className="font-mono text-sm"
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <TypographyMuted className="font-mono text-[11px]">
            {siteConfig.domain}/{pathLabel(values.primary)}
          </TypographyMuted>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Aliases</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => append({ tag: values.primary.tag, slug: "" })}
              disabled={submitting}
            >
              <PlusIcon className="size-3.5" aria-hidden="true" />
              Add alias
            </Button>
          </div>
          {fields.length === 0 ? (
            <TypographyMuted className="text-xs">
              Extra paths that resolve to the same target.
            </TypographyMuted>
          ) : (
            <div className="flex flex-col gap-3">
              {fields.map((row, i) => (
                <div key={row.id} className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`aliases.${i}.tag`}
                      render={({ field }) => (
                        <FormItem className="w-36">
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) =>
                                field.onChange(slugify(e.target.value))
                              }
                              placeholder="tag"
                              aria-label="Alias tag"
                              className="font-mono text-sm"
                              disabled={submitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <TypographyMuted className="self-center font-mono text-sm">
                      /
                    </TypographyMuted>
                    <FormField
                      control={form.control}
                      name={`aliases.${i}.slug`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) =>
                                field.onChange(slugify(e.target.value))
                              }
                              placeholder="short-url"
                              aria-label="Alias slug"
                              className="font-mono text-sm"
                              disabled={submitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => remove(i)}
                      disabled={submitting}
                      aria-label="Remove alias"
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                  <TypographyMuted className="font-mono text-[11px]">
                    {siteConfig.domain}/
                    {pathLabel(values.aliases[i] ?? { tag: "", slug: "" })}
                  </TypographyMuted>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preview title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Shown when the link is shared"
                  disabled={submitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preview description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="A sentence for the social card"
                  rows={2}
                  className="resize-none"
                  disabled={submitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ogEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5 pr-3">
                <FormLabel>OpenGraph image</FormLabel>
                <FormDescription>
                  Attach a social preview image (auto-generated if no URL
                  below).
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={submitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {values.ogEnabled && (
          <FormField
            control={form.control}
            name="ogImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom OG image URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://… (blank = auto-generate)"
                    disabled={submitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="permanent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5 pr-3">
                <FormLabel>Permanent redirect</FormLabel>
                <FormDescription>
                  308 instead of 307. Only applies to links without a preview.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={submitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5 pr-3">
                <FormLabel>Enabled</FormLabel>
                <FormDescription>
                  Disabled links resolve to a 404.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={submitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function LinksPanel({ links }: { links: AdminLink[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminLink | null>(null);
  const [isPending, startTransition] = useTransition();

  function openAdd() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(link: AdminLink) {
    setEditTarget(link);
    setDialogOpen(true);
  }

  function handleSubmit(values: LinkFormValues) {
    const raw = {
      ...values,
      aliases: values.aliases.filter((a) => a.slug.trim() !== ""),
    };
    startTransition(async () => {
      const result = editTarget
        ? await updateLink(editTarget.id, raw)
        : await createLink(raw);
      if (result.success) {
        toast.success(editTarget ? "Link updated." : "Link created.");
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  async function handleToggle(id: number) {
    if (pendingId !== null) return;
    setPendingId(id);
    try {
      const result = await toggleLinkEnabled(id);
      if (result.success) router.refresh();
      else toast.error(result.error);
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (pendingId !== null) return;
    setPendingId(id);
    try {
      const result = await deleteLink(id);
      if (result.success) {
        toast.success("Link deleted.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <TypographySmall className="font-semibold">
            Links
          </TypographySmall>
          <TypographyMuted className="text-xs">
            {links.filter((l) => l.enabled).length} of {links.length} enabled
            &middot; redirect any {siteConfig.domain}/path to a target
          </TypographyMuted>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openAdd}>
          <PlusIcon className="size-3.5" aria-hidden="true" />
          Add Link
        </Button>
      </div>

      {links.length === 0 ? (
        <TypographyMuted className="py-8 text-center">
          No short links yet. Add your first one.
        </TypographyMuted>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Path</TableHead>
                <TableHead className="hidden md:table-cell">Target</TableHead>
                <TableHead className="w-16 text-right">Clicks</TableHead>
                <TableHead className="w-20 text-center">Enabled</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => {
                const isRowPending = pendingId === link.id;
                const primaryPath = formatPath(link.primary);
                return (
                  <TableRow
                    key={link.id}
                    className={cn(
                      "transition-opacity",
                      !link.enabled && "opacity-50",
                      isRowPending && "opacity-40 pointer-events-none",
                    )}
                  >
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <TypographySmall asChild>
                            <a
                              href={`/${primaryPath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono hover:underline"
                            >
                              /{primaryPath}
                            </a>
                          </TypographySmall>
                          {link.ogEnabled && (
                            <Badge
                              variant="outline"
                              className="gap-1 px-1.5 py-0 h-4 text-[10px]"
                            >
                              <ImageIcon className="size-2.5" aria-hidden />
                              OG
                            </Badge>
                          )}
                          {link.permanent && (
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 h-4 text-[10px]"
                            >
                              308
                            </Badge>
                          )}
                        </div>
                        {link.aliases.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {link.aliases.map((a) => (
                              <TypographyMuted
                                key={`${a.tag}/${a.slug}`}
                                asChild
                              >
                                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                  /{formatPath(a)}
                                </span>
                              </TypographyMuted>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell py-3 max-w-xs">
                      <TypographyMuted asChild>
                        <a
                          href={link.target}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs hover:text-foreground truncate"
                        >
                          <span className="truncate">{link.target}</span>
                          <ArrowSquareOutIcon
                            className="size-3 shrink-0 opacity-60"
                            aria-hidden
                          />
                        </a>
                      </TypographyMuted>
                    </TableCell>

                    <TableCell className="text-right py-3">
                      <TypographyMuted className="tabular-nums">
                        {link.clicks.toLocaleString()}
                      </TypographyMuted>
                    </TableCell>

                    <TableCell className="text-center py-3">
                      <Switch
                        checked={link.enabled}
                        onCheckedChange={() => handleToggle(link.id)}
                        disabled={isRowPending}
                        aria-label={
                          link.enabled ? "Disable link" : "Enable link"
                        }
                      />
                    </TableCell>

                    <TableCell className="text-right py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => openEdit(link)}
                          aria-label="Edit link"
                        >
                          <PencilIcon className="size-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={isRowPending}
                              aria-label="Delete link"
                            >
                              <TrashIcon className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete /{primaryPath}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently removes the link and all its
                                aliases. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(link.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Link" : "Add Link"}</DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Update the short link below."
                : "Create a short link that redirects to any target."}
            </DialogDescription>
          </DialogHeader>
          <LinkForm
            key={editTarget?.id ?? "new"}
            defaultValues={editTarget ? toFormValues(editTarget) : emptyValues}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            submitting={isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createProject,
  updateProject,
  toggleProjectEnabled,
  deleteProject,
  moveProject,
  type ProjectRow,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@/components/shared/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";

type FormData = {
  title: string;
  description: string;
  highlights: string;
  live: string;
  github: string;
};

const emptyForm: FormData = {
  title: "",
  description: "",
  highlights: "",
  live: "",
  github: "",
};

function parseHighlights(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function ProjectForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const set =
    (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="pf-title">
          Title
        </label>
        <Input
          id="pf-title"
          value={form.title}
          onChange={set("title")}
          placeholder="Project name"
          disabled={submitting}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="pf-description">
          Description
        </label>
        <Textarea
          id="pf-description"
          value={form.description}
          onChange={set("description")}
          placeholder="What does it do?"
          rows={3}
          className="resize-none"
          disabled={submitting}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="pf-highlights">
          Tech highlights
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            (comma-separated)
          </span>
        </label>
        <Input
          id="pf-highlights"
          value={form.highlights}
          onChange={set("highlights")}
          placeholder="TypeScript, React, Bun"
          disabled={submitting}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="pf-github">
          GitHub URL
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </label>
        <Input
          id="pf-github"
          value={form.github}
          onChange={set("github")}
          placeholder="https://github.com/..."
          type="url"
          disabled={submitting}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="pf-live">
          Live URL
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </label>
        <Input
          id="pf-live"
          value={form.live}
          onChange={set("live")}
          placeholder="https://..."
          type="url"
          disabled={submitting}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(form)}
          disabled={
            submitting || !form.title.trim() || !form.description.trim()
          }
          aria-busy={submitting}
        >
          {submitting ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function ProjectsPanel({
  projects: initial,
}: {
  projects: ProjectRow[];
}) {
  const [projects, setProjects] = useState<ProjectRow[]>(initial);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProjectRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function openAdd() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(project: ProjectRow) {
    setEditTarget(project);
    setDialogOpen(true);
  }

  async function handleFormSubmit(form: FormData) {
    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      highlights: parseHighlights(form.highlights),
      live: form.live.trim() || null,
      github: form.github.trim() || null,
    };

    startTransition(async () => {
      if (editTarget) {
        const result = await updateProject(editTarget.id, data);
        if (result.success) {
          setProjects((prev) =>
            prev.map((p) => (p.id === editTarget.id ? { ...p, ...data } : p)),
          );
          toast.success("Project updated.");
          setDialogOpen(false);
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createProject(data);
        if (result.success) {
          // Re-fetch would be ideal; for now add optimistically at end
          const fakeId = Date.now();
          const maxOrder = Math.max(...projects.map((p) => p.sortOrder), -1);
          setProjects((prev) => [
            ...prev,
            { id: fakeId, ...data, enabled: true, sortOrder: maxOrder + 1 },
          ]);
          toast.success("Project created.");
          setDialogOpen(false);
        } else {
          toast.error(result.error);
        }
      }
    });
  }

  async function handleToggle(id: number, current: boolean) {
    if (pendingId !== null) return;
    setPendingId(id);
    try {
      const result = await toggleProjectEnabled(id);
      if (result.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, enabled: !current } : p)),
        );
      } else {
        toast.error(result.error);
      }
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (pendingId !== null) return;
    setPendingId(id);
    try {
      const result = await deleteProject(id);
      if (result.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toast.success("Project deleted.");
      } else {
        toast.error(result.error);
      }
    } finally {
      setPendingId(null);
    }
  }

  async function handleMove(id: number, direction: "up" | "down") {
    if (pendingId !== null) return;
    setPendingId(id);
    try {
      const result = await moveProject(id, direction);
      if (result.success) {
        setProjects((prev) => {
          const sorted = [...prev].sort(
            (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
          );
          const idx = sorted.findIndex((p) => p.id === id);
          const swapIdx = direction === "up" ? idx - 1 : idx + 1;
          if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
          const a = sorted[idx]!;
          const b = sorted[swapIdx]!;
          const newA = a.sortOrder;
          const newB = b.sortOrder;
          return prev.map((p) =>
            p.id === a.id
              ? { ...p, sortOrder: newB }
              : p.id === b.id
                ? { ...p, sortOrder: newA }
                : p,
          );
        });
      } else {
        toast.error(result.error);
      }
    } finally {
      setPendingId(null);
    }
  }

  const sorted = [...projects].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <TypographySmall className="font-semibold">Projects</TypographySmall>
          <TypographyMuted className="text-xs">
            {projects.filter((p) => p.enabled).length} of {projects.length}{" "}
            visible &middot; top = first on site
          </TypographyMuted>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openAdd}>
          <PlusIcon className="size-3.5" aria-hidden="true" />
          Add Project
        </Button>
      </div>

      {sorted.length === 0 ? (
        <TypographyMuted className="py-8 text-center">
          No projects yet. Add your first one.
        </TypographyMuted>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Order</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="hidden md:table-cell">Stack</TableHead>
                <TableHead className="w-20 text-center">Visible</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((project, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === sorted.length - 1;
                const isRowPending = pendingId === project.id;

                return (
                  <TableRow
                    key={project.id}
                    className={cn(
                      "transition-opacity",
                      !project.enabled && "opacity-50",
                      isRowPending && "opacity-40 pointer-events-none",
                    )}
                  >
                    {/* Reorder */}
                    <TableCell className="py-2 align-middle">
                      <div className="flex flex-col gap-0.5 items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={() => handleMove(project.id, "up")}
                          disabled={isFirst || isRowPending}
                          aria-label="Move up"
                        >
                          <ArrowUpIcon className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={() => handleMove(project.id, "down")}
                          disabled={isLast || isRowPending}
                          aria-label="Move down"
                        >
                          <ArrowDownIcon className="size-3" />
                        </Button>
                      </div>
                    </TableCell>

                    {/* Title + description */}
                    <TableCell className="py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold leading-tight">
                            {project.title}
                          </span>
                          {!project.enabled && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 h-4"
                            >
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed max-w-sm">
                          {project.description}
                        </p>
                      </div>
                    </TableCell>

                    {/* Stack badges */}
                    <TableCell className="hidden md:table-cell py-3">
                      <div className="flex flex-wrap gap-1">
                        {project.highlights.slice(0, 4).map((h) => (
                          <span
                            key={h}
                            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                          >
                            {h}
                          </span>
                        ))}
                        {project.highlights.length > 4 && (
                          <span className="text-[10px] text-muted-foreground self-center">
                            +{project.highlights.length - 4}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Visible toggle */}
                    <TableCell className="text-center py-3">
                      <Switch
                        checked={project.enabled}
                        onCheckedChange={() =>
                          handleToggle(project.id, project.enabled)
                        }
                        disabled={isRowPending}
                        aria-label={
                          project.enabled ? "Hide project" : "Show project"
                        }
                      />
                    </TableCell>

                    {/* Edit + Delete */}
                    <TableCell className="text-right py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => openEdit(project)}
                          aria-label="Edit project"
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
                              aria-label="Delete project"
                            >
                              <TrashIcon className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete &quot;{project.title}&quot;?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently removes the project from the
                                database. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(project.id)}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Project" : "Add Project"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Update the project details below."
                : "Fill in the details to add a new project."}
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            initial={
              editTarget
                ? {
                    title: editTarget.title,
                    description: editTarget.description,
                    highlights: editTarget.highlights.join(", "),
                    live: editTarget.live ?? "",
                    github: editTarget.github ?? "",
                  }
                : emptyForm
            }
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            submitting={isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

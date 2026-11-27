"use client";

import { useState } from "react";
import { useForm, type Control } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { isHttpUrl } from "@repo/core/links-schema";
import { projectInputSchema } from "@repo/core/projects-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { useQuery } from "@tanstack/react-query";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { queryKeys } from "@/lib/query/keys";
import {
  createProject,
  getAdminProjects,
  type ProjectInput,
  updateProject,
  toggleProjectEnabled,
  deleteProject,
  moveProject,
  type ProjectRow,
} from "@/app/admin/actions";
import { Button } from "@repo/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@repo/ui/components/button-group";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Switch } from "@repo/ui/components/switch";
import {
  FormActions,
  FormDialog,
  RowActions,
} from "@/app/admin/_components/crud";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  FolderOpenIcon,
} from "@repo/ui/icons";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/cn";
import { TypographyMuted } from "@repo/ui/components/typography";
import { HighlightsField } from "@/app/admin/projects/highlights-field";

const optionalUrlField = z
  .string()
  .trim()
  .refine((value) => value === "" || isHttpUrl(value), {
    message: "Enter a valid http(s):// URL.",
  });

const projectFormSchema = z.object({
  title: projectInputSchema.shape.title,
  description: projectInputSchema.shape.description,
  highlights: projectInputSchema.shape.highlights,
  live: optionalUrlField,
  github: optionalUrlField,
});

type FormData = z.input<typeof projectFormSchema>;

const emptyForm: FormData = {
  title: "",
  description: "",
  highlights: [],
  live: "",
  github: "",
};

const textFields = [
  {
    name: "title",
    label: "Title",
    placeholder: "Project name",
  },
  {
    name: "github",
    label: "GitHub URL",
    hint: "(optional)",
    placeholder: "https://github.com/…",
    type: "url",
  },
  {
    name: "live",
    label: "Live URL",
    hint: "(optional)",
    placeholder: "https://…",
    type: "url",
  },
] as const;

function ProjectTextField({
  control,
  field: spec,
  disabled,
}: {
  control: Control<FormData>;
  field: (typeof textFields)[number];
  disabled: boolean;
}) {
  return (
    <FormField
      control={control}
      name={spec.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {spec.label}
            {"hint" in spec && (
              <span className="text-xs font-normal text-muted-foreground">
                {spec.hint}
              </span>
            )}
          </FormLabel>
          <FormControl>
            <Input
              autoComplete="off"
              {...field}
              placeholder={spec.placeholder}
              type={"type" in spec ? spec.type : "text"}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ProjectForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
  suggestions,
}: {
  initial: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  submitting: boolean;
  suggestions: string[];
}) {
  const form = useForm<FormData>({
    resolver: standardSchemaResolver(projectFormSchema),
    defaultValues: initial,
    mode: "onSubmit",
  });
  const [titleField, ...restFields] = textFields;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <ProjectTextField
          control={form.control}
          field={titleField}
          disabled={submitting}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="What does it do?"
                  rows={3}
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
          name="highlights"
          render={({ field }) => (
            <FormItem>
              <HighlightsField
                value={field.value}
                onChange={field.onChange}
                suggestions={suggestions}
                disabled={submitting}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        {restFields.map((spec) => (
          <ProjectTextField
            key={spec.name}
            control={form.control}
            field={spec}
            disabled={submitting}
          />
        ))}
        <FormActions onCancel={onCancel} submitting={submitting} />
      </form>
    </Form>
  );
}

export function ProjectsPanel() {
  const { data: projects = [] } = useQuery({
    queryKey: queryKeys.admin.projects,
    queryFn: getAdminProjects,
  });
  const [dialog, setDialog] = useState<{
    open: boolean;
    target: ProjectRow | null;
  }>({ open: false, target: null });
  const dialogOpen = dialog.open;
  const highlightSuggestions = [
    ...new Set(projects.flatMap((project) => project.highlights)),
  ];
  const editTarget = dialog.target;

  const save = useActionMutation({
    action: (data: ProjectInput) =>
      editTarget ? updateProject(editTarget.id, data) : createProject(data),
    successMessage: () => (editTarget ? "Project updated." : "Project created."),
    invalidate: [queryKeys.admin.projects],
    onDone: () => setDialog((prev) => ({ ...prev, open: false })),
  });

  const toggle = useActionMutation({
    action: (id: number) => toggleProjectEnabled(id),
    invalidate: [queryKeys.admin.projects],
  });

  const remove = useActionMutation({
    action: (id: number) => deleteProject(id),
    successMessage: "Project deleted.",
    invalidate: [queryKeys.admin.projects],
  });

  const move = useActionMutation({
    action: ({ id, direction }: { id: number; direction: "up" | "down" }) =>
      moveProject(id, direction),
    invalidate: [queryKeys.admin.projects],
  });

  const pendingId = toggle.isPending
    ? toggle.variables
    : remove.isPending
      ? remove.variables
      : move.isPending
        ? move.variables.id
        : null;

  function openAdd() {
    setDialog({ open: true, target: null });
  }

  function openEdit(project: ProjectRow) {
    setDialog({ open: true, target: project });
  }

  function handleFormSubmit(form: FormData) {
    save.mutate({
      title: form.title.trim(),
      description: form.description.trim(),
      highlights: form.highlights.map((h) => h.trim()).filter(Boolean),
      live: form.live.trim() || null,
      github: form.github.trim() || null,
    });
  }

  function handleToggle(id: number) {
    if (pendingId === null) toggle.mutate(id);
  }

  function handleDelete(id: number) {
    if (pendingId === null) remove.mutate(id);
  }

  function handleMove(id: number, direction: "up" | "down") {
    if (pendingId === null) move.mutate({ id, direction });
  }

  const sorted = projects.toSorted(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <TypographyMuted
            role="status"
            aria-live="polite"
            className="text-xs"
          >
            {projects.filter((p) => p.enabled).length} of {projects.length}{" "}
            visible, in the order they appear on the site
          </TypographyMuted>
        </div>
        <Button size="sm" onClick={openAdd}>
          <PlusIcon data-icon="inline-start" className="size-3.5" aria-hidden="true" />
          Add Project
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Empty bordered>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpenIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Add your first one. Whatever sits at the top of the list shows first on the site.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={openAdd}>
              <PlusIcon
                data-icon="inline-start"
                className="size-3.5"
                aria-hidden="true"
              />
              Add Project
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Order</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="hidden md:table-cell">Stack</TableHead>
                <TableHead className="w-16 text-center">Visible</TableHead>
                <TableHead className="w-16 text-right">Actions</TableHead>
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
                    <TableCell className="py-2 align-middle">
                      <ButtonGroup
                        orientation="vertical"
                        aria-label="Reorder project"
                      >
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-6"
                          onClick={() => handleMove(project.id, "up")}
                          disabled={isFirst || isRowPending}
                          aria-label="Move up"
                        >
                          <ArrowUpIcon className="size-3" />
                        </Button>
                        <ButtonGroupSeparator orientation="horizontal" />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-6"
                          onClick={() => handleMove(project.id, "down")}
                          disabled={isLast || isRowPending}
                          aria-label="Move down"
                        >
                          <ArrowDownIcon className="size-3" />
                        </Button>
                      </ButtonGroup>
                    </TableCell>

                    <TableCell className="min-w-32 py-3 whitespace-normal sm:min-w-56">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex min-w-0 items-start gap-2">
                          <span
                            className="line-clamp-2 text-sm font-semibold leading-tight wrap-anywhere"
                            title={project.title}
                          >
                            {project.title}
                          </span>
                          {!project.enabled && (
                            <Badge
                              variant="outline"
                              className="h-4 shrink-0 px-1.5 py-0 text-3xs"
                            >
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <TypographyMuted
                          className="line-clamp-2 max-w-sm text-xs leading-relaxed wrap-anywhere"
                          title={project.description}
                        >
                          {project.description}
                        </TypographyMuted>
                      </div>
                    </TableCell>

                    <TableCell className="hidden max-w-64 py-3 whitespace-normal md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {project.highlights.slice(0, 4).map((h) => (
                          <span
                            key={h}
                            title={h}
                            className="max-w-40 truncate rounded bg-muted px-1.5 py-0.5 font-mono text-3xs text-muted-foreground"
                          >
                            {h}
                          </span>
                        ))}
                        {project.highlights.length > 4 && (
                          <span className="text-3xs text-muted-foreground self-center">
                            +{project.highlights.length - 4}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center py-3">
                      <Switch
                        checked={project.enabled}
                        onCheckedChange={() =>
                          handleToggle(project.id)
                        }
                        disabled={isRowPending}
                        aria-label={
                          project.enabled ? "Hide project" : "Show project"
                        }
                      />
                    </TableCell>

                    <TableCell className="text-right py-3">
                      <RowActions
                        noun="project"
                        disabled={isRowPending}
                        onEdit={() => openEdit(project)}
                        onDelete={() => handleDelete(project.id)}
                        deleteTitle={<>Delete &quot;{project.title}&quot;?</>}
                        deleteDescription="This permanently removes the project from the database. This cannot be undone."
                        deleteConfirm={`Permanently deletes the project ${project.title}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <FormDialog
        open={dialogOpen}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        title={editTarget ? "Edit Project" : "Add Project"}
        description={
          editTarget
            ? "Update the project details below."
            : "Fill in the details to add a new project."
        }
      >
          <ProjectForm
            initial={
              editTarget
                ? {
                    title: editTarget.title,
                    description: editTarget.description,
                    highlights: editTarget.highlights,
                    live: editTarget.live ?? "",
                    github: editTarget.github ?? "",
                  }
                : emptyForm
            }
            onSubmit={handleFormSubmit}
            onCancel={() => setDialog((prev) => ({ ...prev, open: false }))}
            submitting={save.isPending}
            suggestions={highlightSuggestions}
          />
      </FormDialog>
    </div>
  );
}

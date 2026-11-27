"use client";

import { ChipsCombobox } from "@repo/ui/blocks/chips-combobox";
import { TagIcon } from "@repo/ui/icons";

export function TagFilter({
  allTags,
  tags,
  onTagsChange,
}: {
  allTags: string[];
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}) {
  return (
    <ChipsCombobox
      label="Filter by tags"
      hideLabel
      items={allTags}
      value={tags}
      onValueChange={onTagsChange}
      placeholder="Filter by tag…"
      emptyText="No tags match."
      layout="line"
      tone="brand"
      icon={<TagIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}
      removeLabel={(tag) => `Remove ${tag} filter`}
      clearLabel="Clear all tag filters"
      triggerLabel="Show tags"
    />
  );
}

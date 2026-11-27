"use client";

import { PROJECT_LIMITS } from "@repo/core/projects-schema";
import { ChipsCombobox } from "@repo/ui/blocks/chips-combobox";
import { FormLabel, useFormField } from "@repo/ui/components/form";
import { useMemo } from "react";

export function HighlightsField({
  value,
  onChange,
  suggestions,
  disabled,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: string[];
  disabled?: boolean;
}) {
  const { error, formMessageId } = useFormField();
  const items = useMemo(
    () => [...new Set([...suggestions, ...value])].sort((a, b) => a.localeCompare(b)),
    [suggestions, value],
  );

  return (
    <ChipsCombobox
      label="Tech highlights"
      labelRender={<FormLabel />}
      items={items}
      value={value}
      onValueChange={onChange}
      placeholder="TypeScript, React, Bun…"
      emptyText="Type to add a highlight."
      onCreate={(highlight) => onChange([...value, highlight])}
      maxSelected={PROJECT_LIMITS.highlights}
      disabled={disabled}
      inputProps={{
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? formMessageId : undefined,
      }}
    />
  );
}

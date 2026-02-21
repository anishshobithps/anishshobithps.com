"use client";

import { ChevronDownIcon } from "lucide-react";
import { type ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/cn";
import { TypographyMuted } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ExperienceSkillType = {
  readonly label: string;
  readonly icon?: ReactNode;
};

export type ExperiencePositionItemType = {
  readonly id: string;
  readonly title: string;
  readonly employmentPeriod: string;
  readonly employmentType?: string;
  readonly description?: string | readonly string[];
  readonly skills?: readonly (string | ExperienceSkillType)[];
  readonly isExpanded?: boolean;
};

export type AcquisitionInfo = {
  readonly name: string;
  readonly date?: string;
  readonly renamedTo?: string;
};

export type ExperienceItemType = {
  readonly id: string;
  readonly companyName: string;
  readonly positions: readonly ExperiencePositionItemType[];
  readonly isCurrentEmployer?: boolean;
  readonly acquiredBy?: AcquisitionInfo;
};

export type WorkExperienceProps = {
  className?: string;
  experiences: readonly ExperienceItemType[];
};

export function WorkExperience({
  className,
  experiences,
}: WorkExperienceProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className={cn("flex flex-col divide-y divide-border/30", className)}>
        {experiences.map((exp) => (
          <ExperienceItem key={exp.id} experience={exp} />
        ))}
      </div>
    </TooltipProvider>
  );
}

function ExperienceItem({ experience }: { experience: ExperienceItemType }) {
  const acq = experience.acquiredBy;

  return (
    <div className="grid grid-cols-[1fr] gap-2 py-5 first:pt-0 sm:grid-cols-[180px_1fr] sm:gap-6">
      {/* LEFT: company meta */}
      <div className="flex sm:flex-col sm:items-start sm:pt-0.5 items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          {/* Monogram avatar */}
          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
            {experience.companyName.charAt(0)}
          </span>
          <span className="text-sm font-medium leading-none">
            {experience.companyName}
          </span>

          {experience.isCurrentEmployer && (
            <span className="relative flex size-1.5 shrink-0" aria-label="Current employer">
              <span className="absolute inline-flex size-3 -translate-x-0.5 -translate-y-0.5 animate-ping rounded-full bg-emerald-500 opacity-40" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
          )}
        </div>

        {acq && <AcquisitionBadge acq={acq} />}
      </div>

      {/* RIGHT: positions */}
      <div className="flex flex-col gap-1">
        {experience.positions.map((pos) => (
          <ExperiencePositionItem key={pos.id} position={pos} />
        ))}
      </div>
    </div>
  );
}

function AcquisitionBadge({ acq }: { acq: AcquisitionInfo }) {
  const lines: string[] = [];
  lines.push(`Acquired by ${acq.name}${acq.date ? ` · ${acq.date}` : ""}`);
  if (acq.renamedTo) lines.push(`Renamed to ${acq.renamedTo}`);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="h-5 cursor-default select-none gap-1 rounded-full px-2 text-[10px] text-muted-foreground/70 border-border/50"
        >
          <span className="font-medium">acq.</span>
          {acq.date && <span>{acq.date}</span>}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[220px] text-center text-xs">
        {lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}

function normalizeSkill(s: string | ExperienceSkillType): ExperienceSkillType {
  return typeof s === "string" ? { label: s } : s;
}

function ExperiencePositionItem({
  position,
}: {
  position: ExperiencePositionItemType;
}) {
  const hasDesc = !!position.description;
  const skills = position.skills?.map(normalizeSkill) ?? [];

  const bullets: string[] = Array.isArray(position.description)
    ? (position.description as readonly string[]).map(String)
    : position.description
      ? [position.description as string]
      : [];

  return (
    <Collapsible defaultOpen={position.isExpanded} disabled={!hasDesc} asChild>
      <div className="group/item rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/20 -mx-3">
        <CollapsibleTrigger
          className={cn(
            "flex w-full select-none items-start justify-between gap-3 text-left",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-md",
            "data-disabled:pointer-events-none",
          )}
        >
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-medium leading-snug">
              {position.title}
            </span>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {position.employmentType && (
                <TypographyMuted className="text-xs">
                  {position.employmentType}
                </TypographyMuted>
              )}
              {position.employmentType && (
                <span className="h-3 w-px bg-border/60" aria-hidden />
              )}
              <TypographyMuted className="text-xs font-mono">
                {position.employmentPeriod}
              </TypographyMuted>
            </div>
          </div>

          {hasDesc && (
            <ChevronDownIcon
              className={cn(
                "mt-0.5 size-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-200",
                "group-data-[state=open]/item:rotate-180",
              )}
              aria-hidden
            />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="mt-3 space-y-3.5">
            {bullets.length > 0 && (
              <ul className="space-y-1.5">
                {bullets.map((point, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <span
                      className="mt-[0.4em] size-1 shrink-0 rounded-full bg-muted-foreground/40"
                      aria-hidden
                    />
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground",
                      skill.icon && "pl-1.5",
                    )}
                  >
                    {skill.icon && (
                      <span className="flex size-3.5 shrink-0 items-center justify-center [&_svg]:size-2.5">
                        {skill.icon}
                      </span>
                    )}
                    {skill.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

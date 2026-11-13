import type { Route } from "next";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ButtonGroup } from "@repo/ui/components/button-group";
import { SectionLabel } from "@repo/ui/components/typography";
import { Separator } from "@repo/ui/components/separator";

interface Option {
  label: string;
  detail?: string;
  href: string;
  active: boolean;
}

export function Segmented({ label, options }: { label: string; options: Option[] }) {
  return (
    <div className="flex items-center gap-3">
      <SectionLabel>{label}</SectionLabel>
      <ButtonGroup aria-label={label}>
        {options.map((option) => (
          <Button
            key={option.label}
            asChild
            size="sm"
            variant={option.active ? "secondary" : "outline"}
          >
            <Link
              href={option.href as Route}
              aria-current={option.active ? "page" : undefined}
            >
              {option.label}
              {option.detail && (
                <>
                  <Separator orientation="vertical" />
                  {option.detail}
                </>
              )}
            </Link>
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}

export function PreviewTabs({ active }: { active: "cards" | "readme" }) {
  return (
    <Segmented
      label="View"
      options={[
        { label: "Cards", href: "/svg/preview", active: active === "cards" },
        { label: "README", href: "/svg/preview/readme", active: active === "readme" },
      ]}
    />
  );
}

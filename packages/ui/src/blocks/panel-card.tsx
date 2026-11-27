import type { ReactNode } from "react";
import { PulseIcon, WarningIcon } from "@repo/ui/icons";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { TypographyInlineCode } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";

export function PanelCard({
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn("min-w-0 gap-4 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className={cn("min-w-0 px-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

type SourceResult =
  | { status: "ok" }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

export function SourceNotice({
  source,
  result,
  envVars,
}: {
  source: string;
  result: SourceResult;
  envVars: string[];
}) {
  if (result.status === "ok") return null;
  const unconfigured = result.status === "unconfigured";
  return (
    <Empty bordered className="min-w-0 py-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {unconfigured ? (
            <PulseIcon aria-hidden="true" />
          ) : (
            <WarningIcon aria-hidden="true" />
          )}
        </EmptyMedia>
        <EmptyTitle>
          {unconfigured ? `${source} isn't connected` : `${source} didn't answer`}
        </EmptyTitle>
        <EmptyDescription className="wrap-anywhere">
          {unconfigured ? (
            <>
              Set{" "}
              {envVars.map((name, index) => (
                <span key={name}>
                  {index > 0 && " and "}
                  <TypographyInlineCode>{name}</TypographyInlineCode>
                </span>
              ))}{" "}
              to show this data here.
            </>
          ) : (
            result.message
          )}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

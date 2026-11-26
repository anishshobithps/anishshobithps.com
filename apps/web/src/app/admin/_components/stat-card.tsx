import type { ReactNode } from "react";
import { TrendDownIcon, TrendUpIcon } from "@repo/ui/icons";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { change, formatPercent } from "@/lib/admin-analytics/format";

export function StatCard({
  label,
  value,
  current,
  previous,
  hint,
  icon,
  invert = false,
}: {
  label: string;
  value: string;
  current?: number;
  previous?: number;
  hint?: ReactNode;
  icon?: ReactNode;
  invert?: boolean;
}) {
  const delta =
    current !== undefined && previous !== undefined
      ? change(current, previous)
      : undefined;
  const good = delta !== undefined && delta !== null && (invert ? delta < 0 : delta > 0);

  return (
    <Card className="min-w-0 gap-3 py-4">
      <CardHeader className="px-4">
        <CardDescription className="truncate">{label}</CardDescription>
        {icon && (
          <CardAction className="text-muted-foreground [&_svg]:size-4">
            {icon}
          </CardAction>
        )}
        <CardTitle className="font-display text-2xl tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
      {(delta !== undefined || hint) && (
        <CardFooter className="flex-wrap gap-2 px-4 text-xs text-muted-foreground">
          {delta !== undefined && (
            <Badge
              variant={delta === null || delta === 0 ? "outline" : good ? "secondary" : "destructive"}
              className="tabular-nums"
            >
              {delta === null ? (
                "new"
              ) : delta === 0 ? (
                "0%"
              ) : (
                <>
                  {delta >= 0 ? (
                    <TrendUpIcon data-icon="inline-start" aria-hidden="true" />
                  ) : (
                    <TrendDownIcon data-icon="inline-start" aria-hidden="true" />
                  )}
                  {formatPercent(Math.abs(delta))}
                </>
              )}
            </Badge>
          )}
          {hint && <span className="min-w-0 truncate">{hint}</span>}
        </CardFooter>
      )}
    </Card>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {children}
    </div>
  );
}

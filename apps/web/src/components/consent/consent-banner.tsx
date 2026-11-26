"use client";

import { useId, useRef } from "react";
import { useModel } from "@c15t/nextjs";
import {
  StreamedConsentSurface,
  useBannerCopy,
  useConsentLabels,
  useConsentTextDirection,
  useFocusTrap,
  useHeadlessConsentUI,
  useIABPolicyGuard,
  useScrollLock,
} from "@c15t/nextjs/headless";
import type { HeadlessConsentBannerState } from "@c15t/nextjs/headless";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/cn";

function placementClassName({
  variant,
  position,
  positionSource,
}: HeadlessConsentBannerState) {
  if (variant === "wall") {
    return "top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2";
  }
  if (variant === "bar") {
    return cn("inset-x-0", position === "top" ? "top-0" : "bottom-0");
  }
  const edge = position.startsWith("top") ? "top-4" : "bottom-4";
  const width = variant === "widget" ? "sm:max-w-sm" : "sm:max-w-md";
  if (position.endsWith("-center")) {
    return cn(edge, width, "inset-x-4 mx-auto sm:w-full");
  }
  const left = position.endsWith("-left");
  if (positionSource === "host") {
    return cn(
      edge,
      width,
      "right-4 left-4 sm:w-full",
      left ? "sm:right-auto" : "sm:left-auto",
    );
  }
  return cn(
    edge,
    width,
    "start-4 end-4 sm:w-full",
    left ? "sm:end-auto" : "sm:start-auto",
  );
}

function ConsentBannerContent({ className }: { className?: string }) {
  useIABPolicyGuard();
  const model = useModel() ?? "opt-in";
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  const { banner, openDialog, performAction } = useHeadlessConsentUI();
  const { title, description } = useBannerCopy();
  const labels = useConsentLabels();
  const dir = useConsentTextDirection();
  const visible =
    banner.isVisible && (model === "opt-in" || model === "opt-out");

  useFocusTrap(visible && banner.blocking, ref);
  useScrollLock(visible && banner.blocking);

  if (!visible) return null;

  const stacked = banner.direction === "column" || banner.shouldFillActions;
  const bar = banner.variant === "bar";

  return (
    <>
      {banner.blocking && (
        <div className="fixed inset-0 z-(--z-header) bg-black/10" />
      )}
      <section
        ref={ref}
        dir={dir}
        tabIndex={-1}
        role={banner.blocking ? "dialog" : "region"}
        aria-modal={banner.blocking || undefined}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        className={cn(
          "fixed z-(--z-header) flex flex-col outline-none",
          placementClassName(banner),
          className,
        )}
      >
        <Card className={cn("gap-4 py-5 shadow-lg", bar && "rounded-none")}>
          <CardHeader className="px-5">
            <CardTitle id={`${id}-title`}>{title}</CardTitle>
            <CardDescription id={`${id}-description`} className="text-pretty">
              {description}
            </CardDescription>
          </CardHeader>
          <CardFooter
            className={cn(
              "gap-2 px-5",
              stacked ? "flex-col items-stretch" : "flex-wrap justify-between",
            )}
          >
            {banner.preferenceControls.map((right) => (
              <Button
                key={right}
                type="button"
                variant="link"
                size="sm"
                className="px-0"
                onClick={openDialog}
              >
                {labels.preferenceControls[right]}
              </Button>
            ))}
            {banner.actionGroups.map((group) => (
              <div
                key={group.join("-")}
                className={cn("flex gap-2", stacked ? "flex-col" : "flex-wrap")}
              >
                {group.map((action) => (
                  <Button
                    key={action}
                    type="button"
                    size="sm"
                    variant={
                      banner.primaryActions.includes(action)
                        ? "default"
                        : "outline"
                    }
                    onClick={() => performAction(action)}
                  >
                    {labels.actions[action]}
                  </Button>
                ))}
              </div>
            ))}
          </CardFooter>
        </Card>
      </section>
    </>
  );
}

export function ConsentBanner({ className }: { className?: string }) {
  return (
    <StreamedConsentSurface>
      <ConsentBannerContent className={className} />
    </StreamedConsentSurface>
  );
}

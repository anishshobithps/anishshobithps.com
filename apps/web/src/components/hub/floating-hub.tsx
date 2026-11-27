"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@repo/ui/components/button";
import { XIcon } from "@repo/ui/icons";
import { LogoMascot } from "@repo/ui/brand/logo-mascot";
import { cn } from "@repo/ui/lib/cn";
import { playCue } from "@repo/sounds/sound-player";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover";
import { useDraggable } from "@/hooks/use-draggable";

const loadPanel = () => import("@/components/hub/panel");

const HubPanel = dynamic(loadPanel, { ssr: false });

const FAB_SIZE = 48;

export function FloatingHub({ repoCard }: { repoCard: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { position, dragging, wasDragged, handlers } = useDraggable(
    "floating-hub:position",
    FAB_SIZE,
  );

  if (!position) return null;

  const close = () => {
    playCue("close");
    setOpen(false);
  };

  return (
    <div
      style={{ left: position.x, top: position.y }}
      className="fixed z-40 print:hidden"
    >
      <Popover
        open={open}
        presentation="auto"
        onOpenChange={(next, details) => {
          if (details.reason === "trigger-press" && wasDragged()) {
            details.cancel();
            playCue("drop");
            return;
          }
          playCue(next ? "open" : "close");
          setOpen(next);
        }}
      >
        <PopoverTrigger
          aria-label={open ? "Close quick menu" : "Open quick menu"}
          {...handlers}
          onPointerEnter={() => void loadPanel()}
          onFocus={() => void loadPanel()}
          className={cn(
            "group/fab size-12 touch-none rounded-full border border-border bg-background/90 shadow-lg backdrop-blur-md transition-[transform,box-shadow,border-color] select-none hover:bg-background/90",
            dragging
              ? "scale-105 cursor-grabbing shadow-xl"
              : "cursor-grab hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.96]",
            open && "border-foreground/30",
          )}
          render={<Button variant="secondary" size="icon" />}
        >
          {open ? (
            <XIcon aria-hidden="true" className="size-5 text-foreground" />
          ) : (
            <LogoMascot
              size={24}
              eyes={dragging ? "happy" : "open"}
              className="text-foreground"
            />
          )}
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          collisionPadding={16}
          className="z-50 max-h-[min(80vh,var(--available-height))] w-96 origin-(--transform-origin) overflow-y-auto overscroll-contain rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none transition-[opacity,scale] duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[presentation=popover]:data-ending-style:scale-95 data-[presentation=popover]:data-starting-style:scale-95 motion-reduce:transition-none data-[presentation=sheet]:max-h-[85dvh] data-[presentation=sheet]:w-full data-[presentation=sheet]:rounded-b-none data-[presentation=sheet]:border-b-0"
        >
          <PopoverTitle className="sr-only">Quick menu</PopoverTitle>
          <div
            aria-hidden="true"
            className="mx-auto mt-2 hidden h-1 w-10 rounded-full bg-muted-foreground/40 in-data-[presentation=sheet]:block"
          />
          <HubPanel repoCard={repoCard} onClose={close} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

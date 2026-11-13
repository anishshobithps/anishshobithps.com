"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";

import { Button } from "@repo/ui/components/button";
import { XIcon } from "@repo/icons";
import { LogoMascot } from "@/components/shared/logo-mascot";
import { useDraggable } from "@/hooks/use-draggable";
import { useIsMobile } from "@repo/ui/hooks/use-mobile";
import { cn } from "@repo/ui/lib/cn";
import { playCue } from "@repo/sounds/sound-player";

const HubPanel = dynamic(() => import("@/components/shared/hub-panel"), {
  ssr: false,
});

const FAB_SIZE = 48;

export function FloatingHub({ repoCard }: { repoCard: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [boundary, setBoundary] = useState<Element | null>(null);
  const [warm, setWarm] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const { position, dragging, wasDragged, handlers } = useDraggable(
    "floating-hub:position",
    FAB_SIZE,
  );

  const changeOpen = useCallback((next: boolean) => {
    playCue(next ? "open" : "close");
    setOpen(next);
  }, []);

  const toggle = useCallback(() => {
    if (wasDragged()) {
      playCue("drop");
      return;
    }
    setBoundary(document.getElementById("main-content"));
    changeOpen(!open);
  }, [wasDragged, changeOpen, open]);

  if (!position) return null;

  const fab = (
    <Button
      ref={fabRef}
      type="button"
      variant="secondary"
      size="icon"
      aria-label={open ? "Close quick menu" : "Open quick menu"}
      aria-haspopup="dialog"
      aria-expanded={open}
      {...handlers}
      onPointerEnter={() => setWarm(true)}
      onFocus={() => setWarm(true)}
      onClick={toggle}
      className={cn(
        "group/fab size-12 touch-none rounded-full border border-border bg-background/90 shadow-lg backdrop-blur-md transition-[transform,box-shadow,border-color] select-none hover:bg-background/90",
        dragging
          ? "scale-105 cursor-grabbing shadow-xl"
          : "cursor-grab hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.96]",
        open && "border-foreground/30",
      )}
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
    </Button>
  );

  return (
    <div
      style={{
        left: position.x,
        top: position.y,
      }}
      className="fixed z-40 print:hidden"
    >
      {fab}
      {(warm || open) && (
        <HubPanel
          open={open}
          onOpenChange={changeOpen}
          isMobile={isMobile}
          boundary={boundary}
          fabRef={fabRef}
          repoCard={repoCard}
        />
      )}
    </div>
  );
}

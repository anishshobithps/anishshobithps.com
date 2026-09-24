import { IsoStage } from "@/components/diagrams/iso-stage";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface ArtStageProps {
  className?: string;
  children: ReactNode;
}

export function ArtStage({ className, children }: ArtStageProps) {
  return (
    <IsoStage ambient className={cn("relative", className)}>
      <div aria-hidden="true" className="iso-canvas hero-art-grid absolute inset-0" />
      {children}
    </IsoStage>
  );
}

interface HeroWithArtProps {
  art: ReactNode;
  children: ReactNode;
}

export function HeroWithArt({ art, children }: HeroWithArtProps) {
  return (
    <div className="iso-trigger grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="flex min-w-0 flex-col gap-5 sm:gap-6">{children}</div>
      <ArtStage className="order-first -mx-gutter -mt-6 h-44 md:order-none md:mx-0 md:-my-8 md:h-auto md:aspect-[4/3]">
        {art}
      </ArtStage>
    </div>
  );
}

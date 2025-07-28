import React, { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  className?: string;
  children: ReactNode;
};

export function Section({ className, children }: SectionProps) {
  return (
    <section className="border border-edge">
      <div className="max-w-6xl mx-auto border-x border-edge">
        <div
          className={cn(
            "px-[clamp(1rem,5vw,2rem)] py-[clamp(2rem,6vw,4rem)]",
            className
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

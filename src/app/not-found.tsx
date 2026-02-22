"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
} from "@/components/ui/empty";
import { HomeIcon } from "lucide-react";
import { TypographyP, TypographyMuted, TypographyMark } from "@/components/ui/typography";
import Link from "next/link";
import { useRef } from "react";
import { BouncingLogos } from "@/components/shared/bouncing-logo";
import { FlickerText } from "@/components/shared/flicker-text";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      role="main"
      aria-label="Page not found"
      className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden"
    >
      <div aria-hidden="true">
        <BouncingLogos containerRef={containerRef} />
      </div>

      <Empty className="z-10 backdrop-blur-sm" role="status" aria-live="polite">
        <EmptyHeader>
          <FlickerText
            chars={["4", "logo", "4"]}
            charWidth={96}
            className="text-foreground"
            aria-label="404"
          />

          <div className="space-y-2 text-center">
            <TypographyP className="text-lg font-semibold tracking-tight">
              Even my 404 has motion
            </TypographyP>
            <TypographyMuted>
              I spent weeks on this site and you landed on the{" "}
              <TypographyMark>one page that doesn't exist</TypographyMark>.
              Respect the effort.
            </TypographyMuted>
          </div>
        </EmptyHeader>

        <EmptyContent>
          <Button asChild size="lg">
            <Link
              href="/"
              aria-label="Go back to the home page"
              className="flex items-center gap-2"
            >
              <HomeIcon aria-hidden="true" data-icon="inline-start" />
              Go Home
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

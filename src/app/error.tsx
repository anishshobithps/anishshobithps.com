"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
} from "@/components/ui/empty";
import { HomeIcon, RotateCcwIcon } from "lucide-react";
import { TypographyP, TypographyMuted } from "@/components/ui/typography";
import Link from "next/link";
import { useRef } from "react";
import { BouncingLogos } from "@/components/shared/bouncing-logo";
import { FlickerText } from "@/components/shared/flicker-text";

interface ErrorProps {
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden"
    >
      <BouncingLogos containerRef={containerRef} />

      <Empty className="z-10 backdrop-blur-sm">
        <EmptyHeader>
          <FlickerText
            chars={["5", "0", "0"]}
            charWidth={76}
            className="text-foreground"
          />

          <div className="space-y-2 text-center">
            <TypographyP className="text-lg font-semibold tracking-tight">
              The code tripped
            </TypographyP>
            <TypographyMuted>
              Something internally panicked, <br />
              We can act like this never happened.
            </TypographyMuted>
          </div>
        </EmptyHeader>

        <EmptyContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={reset}
              className="flex items-center gap-2"
            >
              <RotateCcwIcon data-icon="inline-start" />
              Try Again
            </Button>
            <Button asChild size="lg">
              <Link href="/" className="flex items-center gap-2">
                <HomeIcon data-icon="inline-start" />
                Go Home
              </Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}

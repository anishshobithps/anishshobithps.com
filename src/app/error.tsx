"use client";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader } from "@/components/ui/empty";
import {
  HouseIcon,
  ArrowCounterClockwiseIcon,
} from "@/components/shared/icons";
import {
  Text,
  TypographyMuted,
  TypographyMark,
} from "@/components/ui/typography";
import Link from "next/link";
import { useRef } from "react";
import { BouncingLogos } from "@/components/shared/bouncing-logo";
import { FlickerText } from "@/components/shared/flicker-text";

interface ErrorProps {
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorProps) {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <main
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden"
    >
      <div aria-hidden="true">
        <BouncingLogos containerRef={containerRef} />
      </div>

      <Empty className="z-10 backdrop-blur-sm" role="alert">
        <EmptyHeader>
          <FlickerText
            chars={["5", "0", "0"]}
            charWidth={76}
            className="text-foreground"
            label="Error 500"
          />

          <div className="space-y-2 text-center">
            <Text as="h1" variant="none" className="text-lg font-semibold tracking-tight">
              The code tripped
            </Text>
            <TypographyMuted>
              Something <TypographyMark>internally panicked</TypographyMark>, we
              can act like this never happened.
            </TypographyMuted>
          </div>
        </EmptyHeader>

        <EmptyContent>
          <nav aria-label="Error recovery actions" className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={reset}
              className="flex items-center gap-2"
            >
              <ArrowCounterClockwiseIcon
                aria-hidden="true"
                data-icon="inline-start"
              />
              Try Again
            </Button>
            <Button asChild size="lg">
              <Link href="/" className="flex items-center gap-2">
                <HouseIcon aria-hidden="true" data-icon="inline-start" />
                Go Home
              </Link>
            </Button>
          </nav>
        </EmptyContent>
      </Empty>
    </main>
  );
}

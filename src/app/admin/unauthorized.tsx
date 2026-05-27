"use client";

import { BouncingLogos } from "@/components/shared/bouncing-logo";
import { HouseIcon, SignOutIcon, WarningIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  TypographyH1,
  TypographyMark,
  TypographyMuted,
} from "@/components/ui/typography";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useRef } from "react";

export function AdminUnauthorized() {
  const { signOut } = useClerk();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      role="main"
      aria-label="Unauthorized"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6"
    >
      <div aria-hidden="true">
        <BouncingLogos containerRef={containerRef} opacity="opacity-[0.08]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-xs">
        <WarningIcon
          className="size-12 text-destructive"
          weight="duotone"
          aria-hidden="true"
        />

        <div className="space-y-3">
          <TypographyH1 className="text-3xl">Access Denied</TypographyH1>
          <TypographyMuted className="text-base leading-relaxed">
            This admin belongs to{" "}
            <TypographyMark>one specific account</TypographyMark> — and it is
            not yours.
          </TypographyMuted>
          <TypographyMuted className="font-mono text-xs text-muted-foreground/50">
            // try being the owner next time.
          </TypographyMuted>
        </div>

        <ButtonGroup>
          <Button asChild size="lg" variant="outline" className="font-semibold">
            <Link href="/" aria-label="Back to site">
              <HouseIcon weight="bold" aria-hidden="true" />
              Back to site
            </Link>
          </Button>
          <ButtonGroupSeparator />
          <Button
            size="lg"
            variant="outline"
            className="font-semibold"
            onClick={() => signOut({ redirectUrl: "/" })}
            aria-label="Sign out"
          >
            <SignOutIcon weight="bold" aria-hidden="true" />
            Sign out
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

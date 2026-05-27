"use client";

import { Card } from "@/components/layouts/page";
import { SignOutIcon, WarningIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
} from "@/components/ui/typography";
import { useClerk } from "@clerk/nextjs";

export function AdminUnauthorized() {
  const { signOut } = useClerk();

  return (
    <div className="flex min-h-svh items-center justify-center px-6">
      <Card className="w-full max-w-sm flex flex-col items-center gap-6 py-10 text-center">
        <WarningIcon className="size-10 text-destructive" weight="duotone" />
        <div className="flex flex-col gap-2">
          <TypographyH1 className="text-2xl">Not Eligible</TypographyH1>
          <TypographyLead className="text-base">
            Your account does not have admin access.
          </TypographyLead>
          <TypographyMuted className="text-xs">
            Admin access is restricted to a specific account set in the
            environment.
          </TypographyMuted>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="gap-2 w-full"
          onClick={() => signOut({ redirectUrl: "/" })}
        >
          <SignOutIcon weight="bold" />
          Sign out
        </Button>
      </Card>
    </div>
  );
}

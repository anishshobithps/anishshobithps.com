"use client";

import { usePathname } from "next/navigation";
import { SignInTrigger, useSiteAuth } from "@/components/shared/site-auth";
import { Button } from "@repo/ui/components/button";
import { Text } from "@repo/ui/components/typography";
import { SignInIcon, SignOutIcon } from "@repo/icons";
import { EmptyAvatar, Pass } from "@/components/shared/hub-widgets";
import { Avatar } from "@/components/engagement/avatar";

export default function HubAuth({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { user, isSignedIn, isLoaded, signOut } = useSiteAuth();

  return (
    <>
      {!isLoaded ? (
        <div
          aria-hidden="true"
          className="h-14 animate-pulse rounded-lg border border-border bg-muted/30"
        />
      ) : isSignedIn && user ? (
        <Pass
          stub={
            <span className="relative">
              <Avatar
                imageUrl={user.imageUrl}
                name={user.fullName || user.username || "You"}
                size="size-8"
              />
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-(--color-available) ring-2 ring-background"
              />
            </span>
          }
        >
          <div className="min-w-0 flex-1">
            <Text as="p" variant="small" className="truncate text-foreground">
              {user.fullName || user.username || "You"}
            </Text>
            {user.email && (
              <Text as="p" variant="muted" className="truncate text-xs">
                {user.email}
              </Text>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              signOut({ redirectUrl: pathname });
            }}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <SignOutIcon
              data-icon="inline-start"
              aria-hidden="true"
              className="size-3.5"
            />
            Sign out
          </Button>
        </Pass>
      ) : (
        <Pass stub={<EmptyAvatar />}>
          <div className="min-w-0 flex-1">
            <Text as="p" variant="small" className="text-foreground">
              No pass yet
            </Text>
            <Text as="p" variant="muted" className="text-xs">
              Sign in to comment, react and sign.
            </Text>
          </div>
          <SignInTrigger
            forceRedirectUrl={pathname}
            signUpForceRedirectUrl={pathname}
          >
            <Button
              type="button"
              size="sm"
              className="shrink-0 pointer-coarse:h-11"
            >
              <SignInIcon
                data-icon="inline-start"
                aria-hidden="true"
                className="size-3.5"
              />
              Sign in
            </Button>
          </SignInTrigger>
        </Pass>
      )}
    </>
  );
}

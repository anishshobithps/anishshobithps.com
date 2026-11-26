"use client";

import { ClerkProvider, useClerk, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import type { BridgeState } from "@/components/shared/site-auth";
import { syncIdentity, track } from "@/lib/analytics/events";

function Publisher({ publish }: { publish: (state: BridgeState) => void }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const clerk = useClerk();

  useEffect(() => {
    if (!isLoaded) return;
    syncIdentity(
      isSignedIn && user
        ? { id: user.id, username: user.username, fullName: user.fullName }
        : null,
    );
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    publish({
      isLoaded,
      isSignedIn: !!isSignedIn,
      user: user
        ? {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            imageUrl: user.imageUrl,
            email: user.primaryEmailAddress?.emailAddress ?? null,
          }
        : null,
      signOut: async (options) => {
        track("signed_out", { pathname: window.location.pathname });
        syncIdentity(null);
        await clerk.signOut(options);
      },
      openSignIn: (options) => clerk.openSignIn(options ?? {}),
    });
  }, [publish, isLoaded, isSignedIn, user, clerk]);

  return null;
}

export default function ClerkBridge({
  publish,
}: {
  publish: (state: BridgeState) => void;
}) {
  return (
    <ClerkProvider>
      <Publisher publish={publish} />
    </ClerkProvider>
  );
}

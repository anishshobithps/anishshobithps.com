"use client";

import { ClerkProvider, useClerk, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import type { BridgeState } from "@/components/shared/site-auth";

function Publisher({ publish }: { publish: (state: BridgeState) => void }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const clerk = useClerk();

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
      signOut: (options) => clerk.signOut(options),
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

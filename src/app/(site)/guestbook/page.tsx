import { getGuestbookEntries } from "@/app/(site)/guestbook/actions";
import { GuestbookClient } from "@/app/(site)/guestbook/guestbook-client";
import { Section } from "@/components/layouts/page";
import { JsonLd } from "@/components/shared/json-ld";
import {
  TypographyH1,
  TypographyLead,
  TypographyMark,
} from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/metadata";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = buildMeta({
  title: "Guestbook",
  pageTitle: "Guestbook",
  description: `Leave a message for ${siteConfig.name}. Sign in and say hello — a digital guestbook of everyone who stopped by.`,
  path: "home / guestbook",
  canonicalPath: "/guestbook",
  type: "website",
});

async function GuestbookFeed({ currentUserId }: { currentUserId: string | null }) {
  const { entries, total, hasMore } = await getGuestbookEntries();
  return (
    <GuestbookClient
      initialEntries={entries}
      currentUserId={currentUserId}
      total={total}
      initialHasMore={hasMore}
    />
  );
}

function GuestbookFallback() {
  return (
    <div className="w-full space-y-6" aria-hidden="true">
      <div className="h-32 rounded-md border border-border/40 bg-muted/20 animate-pulse" />
      <div className="h-[50vh] rounded-md border border-border/40 bg-muted/20 animate-pulse" />
    </div>
  );
}

export default async function GuestbookPage() {
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <JsonLd
        type="webpage"
        title="Guestbook"
        description={`Leave a message for ${siteConfig.name}.`}
        canonicalUrl={`${siteConfig.baseUrl}/guestbook`}
      />

      <Section variant="hero" aria-label="Guestbook">
        <TypographyH1>Guestbook</TypographyH1>
        <TypographyLead>
          You stopped by. <TypographyMark>Leave a mark.</TypographyMark>
        </TypographyLead>
      </Section>

      <Section aria-label="Guestbook entries">
        <Suspense fallback={<GuestbookFallback />}>
          <GuestbookFeed currentUserId={userId} />
        </Suspense>
      </Section>
    </ClerkProvider>
  );
}

import { PageArt } from "@/components/diagrams/page-art";
import { HeroWithArt } from "@/components/layouts/hero-art";
import { getGuestbookEntries } from "@/app/(site)/guestbook/actions";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { GuestbookClient } from "@/app/(site)/guestbook/guestbook-client";
import { Panel, PanelRow, Section } from "@/components/layouts/page";
import { JsonLd } from "@/components/shared/json-ld";
import {
  TypographyH1,
  TypographyLead,
  TypographyMark,
} from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/metadata";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = buildMeta({
  title: "Guestbook",
  pageTitle: "Guestbook",
  description: `Leave a message for ${siteConfig.name}. Sign in and say hello in a digital guestbook of everyone who stopped by.`,
  path: "home / guestbook",
  canonicalPath: "/guestbook",
  type: "website",
});

async function GuestbookFeed({ currentUserId }: { currentUserId: string | null }) {
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.guestbook,
    queryFn: ({ pageParam }) => getGuestbookEntries({ offset: pageParam }),
    initialPageParam: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GuestbookClient currentUserId={currentUserId} />
    </HydrationBoundary>
  );
}

function GuestbookFallback() {
  return (
    <Panel aria-hidden="true" className="animate-pulse">
      <PanelRow className="h-32" />
      <PanelRow className="h-[50vh]" />
    </Panel>
  );
}

export default async function GuestbookPage() {
  const { userId } = await auth();

  return (
    <>
      <JsonLd
        type="webpage"
        title="Guestbook"
        description={`Leave a message for ${siteConfig.name}.`}
        canonicalUrl={`${siteConfig.baseUrl}/guestbook`}
      />

      <Section variant="hero" aria-label="Guestbook">
        <HeroWithArt art={<PageArt name="guestbook" />}>
          <TypographyH1>Guestbook</TypographyH1>
          <TypographyLead>
            You stopped by. <TypographyMark>Leave a mark.</TypographyMark>
          </TypographyLead>
        </HeroWithArt>
      </Section>

      <Section variant="flush" aria-label="Guestbook entries">
        <Suspense fallback={<GuestbookFallback />}>
          <GuestbookFeed currentUserId={userId} />
        </Suspense>
      </Section>
    </>
  );
}

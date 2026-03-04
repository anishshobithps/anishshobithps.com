import { getGuestbookEntries } from "@/app/guestbook/actions";
import { GuestbookClient } from "@/app/guestbook/guestbook-client";
import { Section } from "@/components/layouts/page";
import { JsonLd } from "@/components/shared/json-ld";
import {
  SectionLabel,
  TypographyH1,
  TypographyLead,
  TypographyMark,
} from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/og";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";

export const metadata: Metadata = buildMeta({
  title: "Guestbook",
  pageTitle: "Guestbook",
  description: `Leave a message for ${siteConfig.name}. Sign in and say hello — a digital guestbook of everyone who stopped by.`,
  path: "home / guestbook",
  canonicalPath: "/guestbook",
  type: "website",
});

export const revalidate = 60;

export default async function GuestbookPage() {
  const { userId } = await auth();
  const { entries, total } = await getGuestbookEntries();

  const siteOwnerId =
    process.env.OWNER_CLERK_USER_ID ?? "";

  return (
    <>
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
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>Messages</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        <GuestbookClient
          initialEntries={entries}
          currentUserId={userId}
          siteOwnerId={siteOwnerId}
          total={total}
        />
      </Section>
    </>
  );
}

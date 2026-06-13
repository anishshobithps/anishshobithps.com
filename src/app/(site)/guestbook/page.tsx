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
        <GuestbookClient
          initialEntries={entries}
          currentUserId={userId}
          total={total}
        />
      </Section>
    </ClerkProvider>
  );
}

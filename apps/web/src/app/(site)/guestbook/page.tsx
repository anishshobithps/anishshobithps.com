import { PageArt } from "@repo/diagrams/page-art";
import { HeroWithArt } from "@/components/layouts/hero-art";
import { getGuestbookPreviewPool } from "@/lib/guestbook-preview";
import { GuestbookClient } from "@/app/(site)/guestbook/guestbook-client";
import { Section } from "@/components/layouts/page";
import { JsonLd } from "@/components/shared/json-ld";
import {
  TypographyH1,
  TypographyLead,
  TypographyMark,
} from "@repo/ui/components/typography";
import { siteConfig } from "@repo/site-config";
import { buildMeta } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildMeta({
  title: "Guestbook",
  pageTitle: "Guestbook",
  description: `Leave a message for ${siteConfig.name}. Sign in and say hello in a digital guestbook of everyone who stopped by.`,
  path: "home / guestbook",
  canonicalPath: "/guestbook",
  type: "website",
});

async function GuestbookArt() {
  const pool = await getGuestbookPreviewPool();
  const names = pool.slice(0, 8).map((entry) => entry.user.name);
  return <PageArt name="guestbook" data={names} />;
}

export default function GuestbookPage() {
  return (
    <>
      <JsonLd
        type="webpage"
        title="Guestbook"
        description={`Leave a message for ${siteConfig.name}.`}
        canonicalUrl={`${siteConfig.baseUrl}/guestbook`}
      />

      <Section variant="hero" aria-label="Guestbook">
        <HeroWithArt
          art={<GuestbookArt />}
        >
          <TypographyH1>Guestbook</TypographyH1>
          <TypographyLead>
            You stopped by. <TypographyMark>Leave a mark.</TypographyMark>
          </TypographyLead>
        </HeroWithArt>
      </Section>

      <Section variant="flush" aria-label="Guestbook entries">
        <GuestbookClient />
      </Section>
    </>
  );
}

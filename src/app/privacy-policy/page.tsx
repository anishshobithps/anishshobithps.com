import { Section } from "@/components/layouts/page";
import { JsonLd } from "@/components/shared/json-ld";
import {
  TypographyH1,
  TypographyH2,
  TypographyLead,
  TypographyMuted,
  TypographyMark,
  TypographyP,
} from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/og";
import type { Metadata } from "next";

export const metadata: Metadata = buildMeta({
  title: "Privacy Policy",
  pageTitle: "Privacy Policy",
  description: `How ${siteConfig.name}'s website handles your data — what's collected, why, and how it's stored. Short version: not much, and nothing creepy.`,
  path: "home / privacy-policy",
  canonicalPath: "/privacy-policy",
  type: "website",
});

const LAST_UPDATED = "February 23, 2026";

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        type="webpage"
        title="Privacy Policy"
        description={`Privacy policy for ${siteConfig.domain} — data collected, stored, and why.`}
        canonicalUrl={`${siteConfig.baseUrl}/privacy-policy`}
      />

      <Section variant="hero" aria-label="Privacy Policy">
        <TypographyH1>Privacy Policy</TypographyH1>
        <TypographyLead>
          The short version:{" "}
          <TypographyMark>
            I collect very little, store it carefully, and never sell it.
          </TypographyMark>{" "}
          The long version follows.
        </TypographyLead>
        <TypographyMuted className="font-mono">
          Last updated: {LAST_UPDATED}
        </TypographyMuted>
      </Section>

      <Section
        noTopDivider
        innerPadding="pt-4 pb-16"
        aria-label="Privacy policy content"
      >
        <div className="max-w-2xl space-y-10">
          <div className="space-y-3">
            <TypographyH2>What this site is</TypographyH2>
            <TypographyP>
              This is a personal portfolio and blog at{" "}
              <strong>{siteConfig.domain}</strong>. There&apos;s no login, no
              account system, no newsletter. Just words, projects, and a
              probably-over-engineered PDF viewer.
            </TypographyP>
          </div>

          <Separator />

          <div className="space-y-3">
            <TypographyH2>What data is collected</TypographyH2>

            <TypographyH2
              as="h3"
              className="text-base font-semibold border-none pb-0"
            >
              Blog read counts
            </TypographyH2>
            <TypographyP>
              When you visit a blog post, a{" "}
              <TypographyMark>hashed</TypographyMark> version of your IP address
              is stored alongside the post slug to count unique reads. The hash
              is one-way (SHA-256 with a server-side salt) — your actual IP is
              never stored and cannot be reverse-engineered from it.
            </TypographyP>

            <TypographyH2
              as="h3"
              className="text-base font-semibold border-none pb-0"
            >
              Reactions / mood votes
            </TypographyH2>
            <TypographyP>
              If you click one of the reaction buttons on a blog post, your
              choice (one of: <em>Not for me, Meh, Liked it, Loved it</em>) is
              stored with the same hashed IP + post slug pair. Reactions are{" "}
              <TypographyMark>fully voluntary</TypographyMark> — if you
              don&apos;t click anything, nothing is stored.
            </TypographyP>

            <TypographyH2
              as="h3"
              className="text-base font-semibold border-none pb-0"
            >
              What is NOT collected
            </TypographyH2>
            <TypographyP>
              No cookies. No session tokens. No browser fingerprinting. No email
              addresses, names, or any personally identifiable information. No
              tracking pixels. No third-party ad networks.
            </TypographyP>
          </div>

          <Separator />

          <div className="space-y-3">
            <TypographyH2>Where data is stored</TypographyH2>
            <TypographyP>
              Read counts and reactions are stored in a PostgreSQL database
              hosted on{" "}
              <a
                href="https://neon.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Neon
              </a>
              . Data is retained indefinitely but contains no personal
              information — only post slugs, IP hashes, moods, and timestamps.
            </TypographyP>
          </div>

          <Separator />

          <div className="space-y-3">
            <TypographyH2>Analytics (planned)</TypographyH2>
            <TypographyP>
              In the future, this site may use{" "}
              <a
                href="https://umami.is"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Umami Analytics
              </a>{" "}
              — a privacy-focused, open-source analytics tool. Umami does not
              use cookies, does not collect personal data, and complies with
              GDPR, CCPA, and PECR. Page view data would be anonymized and
              aggregated. This policy will be updated when analytics is added.
            </TypographyP>
          </div>

          <Separator />

          <div className="space-y-3">
            <TypographyH2>Third-party services</TypographyH2>
            <TypographyP>
              This site uses Google Fonts (loaded via CSS, subject to{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Google&apos;s Privacy Policy
              </a>
              ). The resume is fetched from a GitHub Releases URL. None of these
              integrations pass any data about you back to this site.
            </TypographyP>
          </div>

          <Separator />

          <div className="space-y-3">
            <TypographyH2>Your rights</TypographyH2>
            <TypographyP>
              Since the only data stored is an irreversible IP hash, there is no
              practical way to identify or retrieve records belonging to you. If
              you have concerns or questions, send me an email at{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                {siteConfig.email}
              </a>
              .
            </TypographyP>
          </div>

          <Separator />

          <div className="space-y-3">
            <TypographyH2>Changes to this policy</TypographyH2>
            <TypographyP>
              If anything meaningful changes (like adding analytics), this page
              will be updated and the &ldquo;Last updated&rdquo; date will
              reflect it. No surprise privacy pivots here.
            </TypographyP>
          </div>
        </div>
      </Section>
    </>
  );
}

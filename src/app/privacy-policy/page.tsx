import { Section } from "@/components/layouts/page";
import { JsonLd } from "@/components/shared/json-ld";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyLead,
  TypographyMuted,
  TypographyMark,
  TypographyP,
  SectionLabel,
} from "@/components/ui/typography";
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

      <Section aria-label="What this site is">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>What this site is</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <div className="max-w-2xl">
          <TypographyP>
            This is a personal portfolio and blog at{" "}
            <TypographyMark>{siteConfig.domain}</TypographyMark>. There&apos;s
            no login, no account system, no newsletter. Just words, projects,
            and a probably-over-engineered PDF viewer.
          </TypographyP>
        </div>
      </Section>

      <Section aria-label="What data is collected">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>What data is collected</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <TypographyH2>Blog read counts</TypographyH2>
            <TypographyP>
              When you visit a blog post, a{" "}
              <TypographyMark>hashed</TypographyMark> version of your IP address
              is stored alongside the post slug to count unique reads. The hash
              is{" "}
              <TypographyMark>
                one-way (SHA-256 with a server-side salt)
              </TypographyMark>{" "}
              — your actual IP is <TypographyMark>never stored</TypographyMark>{" "}
              and cannot be reverse-engineered from it.
            </TypographyP>
          </div>
          <div className="space-y-2">
            <TypographyH2>Reactions / mood votes</TypographyH2>
            <TypographyP>
              If you click one of the reaction buttons on a blog post, your
              choice (one of: <em>Not for me, Meh, Liked it, Loved it</em>) is
              stored with the same hashed IP + post slug pair. Reactions are{" "}
              <TypographyMark>fully voluntary</TypographyMark> — if you
              don&apos;t click anything,{" "}
              <TypographyMark>nothing is stored</TypographyMark>.
            </TypographyP>
          </div>
          <div className="space-y-2">
            <TypographyH3>What is NOT collected</TypographyH3>
            <TypographyP>
              <TypographyMark>No cookies.</TypographyMark> No session tokens. No
              browser fingerprinting. No email addresses, names, or any{" "}
              <TypographyMark>
                personally identifiable information
              </TypographyMark>
              . No tracking pixels.{" "}
              <TypographyMark>No third-party ad networks.</TypographyMark>
            </TypographyP>
          </div>
        </div>
      </Section>

      <Section aria-label="Where data is stored">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>Where data is stored</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <div className="max-w-2xl">
          <TypographyP>
            Read counts and reactions are stored in a PostgreSQL database hosted
            on{" "}
            <a
              href="https://neon.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Neon
            </a>
            . Data is retained indefinitely but contains no personal information
            — only post slugs, IP hashes, moods, and timestamps.
          </TypographyP>
        </div>
      </Section>

      <Section aria-label="Analytics">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>Analytics (planned)</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <div className="max-w-2xl">
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
            — a <TypographyMark>privacy-focused, open-source</TypographyMark>{" "}
            analytics tool. Umami does not use cookies, does not collect
            personal data, and complies with{" "}
            <TypographyMark>GDPR, CCPA, and PECR</TypographyMark>. Page view
            data would be anonymized and aggregated. This policy will be updated
            when analytics is added.
          </TypographyP>
        </div>
      </Section>

      <Section aria-label="Third-party services">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>Third-party services</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <div className="max-w-2xl">
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
      </Section>

      <Section aria-label="Your rights">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>Your rights</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <div className="max-w-2xl">
          <TypographyP>
            Since the only data stored is an{" "}
            <TypographyMark>irreversible IP hash</TypographyMark>, there is no
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
      </Section>

      <Section aria-label="Changes to this policy">
        <div className="flex items-center gap-3 mb-10" aria-hidden="true">
          <SectionLabel>Changes to this policy</SectionLabel>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <div className="max-w-2xl">
          <TypographyP>
            If anything meaningful changes (like adding analytics), this page
            will be updated and the{" "}
            <TypographyMark>&ldquo;Last updated&rdquo;</TypographyMark> date
            will reflect it. No surprise privacy pivots here.
          </TypographyP>
        </div>
      </Section>
    </>
  );
}

import { PageArt } from "@/components/diagrams/page-art";
import { HeroWithArt } from "@/components/layouts/hero-art";
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
  SectionHeader,
} from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildMeta({
  title: "Privacy Policy",
  pageTitle: "Privacy Policy",
  description: `How ${siteConfig.name}'s website handles your data: what's collected, why, and how it's stored. Short version: not much, and nothing creepy.`,
  path: "home / privacy-policy",
  canonicalPath: "/privacy-policy",
  type: "website",
});

const LAST_UPDATED = "September 14, 2026";

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        type="webpage"
        title="Privacy Policy"
        description={`Privacy policy for ${siteConfig.domain}: what is collected, where it is stored, and why.`}
        canonicalUrl={`${siteConfig.baseUrl}/privacy-policy`}
      />

      <Section variant="hero" aria-label="Privacy Policy">
        <HeroWithArt art={<PageArt name="privacy" />}>
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
        </HeroWithArt>
      </Section>

      <Section aria-label="What this site is">
        <SectionHeader>What this site is</SectionHeader>
        <div className="max-w-2xl">
          <TypographyP>
            This is a personal portfolio and blog at{" "}
            <TypographyMark>{siteConfig.domain}</TypographyMark>. There&apos;s
            no newsletter. The site has a{" "}
            <TypographyMark>guestbook</TypographyMark> and a{" "}
            <TypographyMark>blog comments section</TypographyMark>, both of
            which require signing in via <TypographyMark>Clerk</TypographyMark>{" "}
            (GitHub, Google, or Discord) to leave a message, post a comment, or
            like an entry. Everything else, including blog posts, projects, and
            the resume, is fully public and requires no account.
          </TypographyP>
        </div>
      </Section>

      <Section aria-label="What data is collected">
        <SectionHeader>What data is collected</SectionHeader>
        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <TypographyH2 className="border-b border-border pb-2">Blog read counts</TypographyH2>
            <TypographyP>
              When you visit a blog post, a{" "}
              <TypographyMark>hashed</TypographyMark> version of your IP address
              is stored alongside the post slug to count unique reads. The hash
              is{" "}
              <TypographyMark>
                one-way (SHA-256 with a server-side salt)
              </TypographyMark>
              . Your actual IP is <TypographyMark>never stored</TypographyMark>{" "}
              and cannot be reverse-engineered from it.
            </TypographyP>
          </div>
          <div className="space-y-2">
            <TypographyH2 className="border-b border-border pb-2">Reactions / mood votes</TypographyH2>
            <TypographyP>
              If you click one of the reaction buttons on a blog post, your
              choice (one of: <em>Not for me, Meh, Liked it, Loved it</em>) is
              stored with the same hashed IP + post slug pair. Reactions are{" "}
              <TypographyMark>fully voluntary</TypographyMark>. If you
              don&apos;t click anything,{" "}
              <TypographyMark>nothing is stored</TypographyMark>.
            </TypographyP>
          </div>
          <div className="space-y-2">
            <TypographyH2 className="border-b border-border pb-2">Short link clicks</TypographyH2>
            <TypographyP>
              Following a short link (any{" "}
              <TypographyMark>{siteConfig.domain}/&lt;slug&gt;</TypographyMark>{" "}
              that redirects somewhere else) adds one to a counter on that
              link. No IP address, hash, account, or per-click timestamp is
              recorded, so the number says how many times a link was followed
              and <TypographyMark>nothing about who followed it</TypographyMark>.
            </TypographyP>
          </div>
          <div className="space-y-2">
            <TypographyH2 className="border-b border-border pb-2">Guestbook entries &amp; likes</TypographyH2>
            <TypographyP>
              If you sign in and leave a guestbook message, the following is
              stored in our database:{" "}
              <TypographyMark>
                your Clerk user ID, your message text, and a timestamp
              </TypographyMark>
              . If you like an entry, your Clerk user ID and the entry ID are
              stored. Your{" "}
              <TypographyMark>
                name, username, and profile picture
              </TypographyMark>{" "}
              are fetched live from Clerk when rendering the guestbook, not
              stored in our database. Both actions are{" "}
              <TypographyMark>fully voluntary</TypographyMark>. If you
              don&apos;t sign in, nothing is stored.
            </TypographyP>
          </div>
          <div className="space-y-2">
            <TypographyH2 className="border-b border-border pb-2">Blog post comments &amp; comment likes</TypographyH2>
            <TypographyP>
              If you sign in and post a comment on a blog post, the following is
              stored in our database:{" "}
              <TypographyMark>
                your Clerk user ID, your comment text, the post slug, an
                optional parent comment ID (for replies), and a timestamp
              </TypographyMark>
              . If you like a comment, your Clerk user ID and the comment ID are
              stored. Deleted comments are{" "}
              <TypographyMark>soft-deleted</TypographyMark>: the text is hidden
              but the record is retained for referential integrity. Full deletion
              is honoured on request (see Your rights below). Your{" "}
              <TypographyMark>
                name, username, and profile picture
              </TypographyMark>{" "}
              are fetched live from Clerk when rendering comments, not stored
              in our database. Both actions are{" "}
              <TypographyMark>fully voluntary</TypographyMark>. If you
              don&apos;t sign in, nothing is stored.
            </TypographyP>
          </div>
          <div className="space-y-2">
            <TypographyH3>What is not collected</TypographyH3>
            <TypographyP>
              There is no browser fingerprinting, no tracking pixels, and{" "}
              <TypographyMark>no third-party ad networks</TypographyMark>. No
              email addresses or passwords are stored in this site&apos;s own
              database, because authentication is fully delegated to{" "}
              <TypographyMark>Clerk</TypographyMark> (see Third-party services
              below). If you never sign in to the guestbook or comments, no
              personally identifiable information about you is stored anywhere
              by this site.
            </TypographyP>
          </div>
        </div>
      </Section>

      <Section aria-label="Where data is stored">
        <SectionHeader>Where data is stored</SectionHeader>
        <div className="max-w-2xl space-y-4">
          <TypographyP>
            Read counts and reactions are stored in a PostgreSQL database hosted
            on{" "}
            <a
              href="https://neon.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="link-external"
            >
              Neon
            </a>
            . These records contain no personal information, only post slugs,
            IP hashes, moods, and timestamps.
          </TypographyP>
          <TypographyP>
            Guestbook entries, likes, blog comments, and comment likes are all
            stored in the same Neon PostgreSQL database. These records contain
            your <TypographyMark>Clerk user ID</TypographyMark>, message/comment
            text, post slug, and timestamps. Your Clerk user ID is an opaque
            identifier assigned by Clerk, not your email, name, or any other
            human-readable detail. Your profile information (name, username,
            avatar) is stored and managed by{" "}
            <a
              href="https://clerk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="link-external"
            >
              Clerk
            </a>
            , not in our database.
          </TypographyP>
        </div>
      </Section>

      <Section aria-label="Analytics">
        <SectionHeader>Analytics</SectionHeader>
        <div className="max-w-2xl">
          <TypographyP>
            This site uses{" "}
            <a
              href="https://umami.is"
              target="_blank"
              rel="noopener noreferrer"
              className="link-external"
            >
              Umami Analytics
            </a>{" "}
            , a <TypographyMark>privacy-focused, open-source</TypographyMark>{" "}
            analytics tool hosted on{" "}
            <a
              href="https://umami.is/docs/cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="link-external"
            >
              Umami Cloud
            </a>
            . Umami does <TypographyMark>not use cookies</TypographyMark>, does
            not collect personal data, and complies with{" "}
            <TypographyMark>GDPR, CCPA, and PECR</TypographyMark>. Only
            anonymized, aggregated page view data is recorded, with no IP
            addresses, no fingerprinting, and no cross-site tracking. The
            script and the events it sends are{" "}
            <TypographyMark>proxied through this domain</TypographyMark>, so
            your browser never connects to Umami directly.
          </TypographyP>
        </div>
      </Section>

      <Section aria-label="Third-party services">
        <SectionHeader>Third-party services</SectionHeader>
        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <TypographyH2 className="border-b border-border pb-2">Spotify</TypographyH2>
            <TypographyP>
              The footer displays what I&apos;m currently listening to (or last
              listened to) via the{" "}
              <a
                href="https://developer.spotify.com/documentation/web-api"
                target="_blank"
                rel="noopener noreferrer"
                className="link-external"
              >
                Spotify Web API
              </a>
              . This is a{" "}
              <TypographyMark>read-only, server-side</TypographyMark> call using
              my own account credentials, and no data about you is sent to Spotify.
              The currently playing track is cached for{" "}
              <TypographyMark>60 seconds</TypographyMark> on the server; no
              Spotify data is stored in the database.
            </TypographyP>
          </div>
          <div className="space-y-2">
            <TypographyH2 className="border-b border-border pb-2">Clerk (Authentication)</TypographyH2>
            <TypographyP>
              Sign-in for the guestbook and blog comments is handled by{" "}
              <a
                href="https://clerk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link-external"
              >
                Clerk
              </a>
              . When you sign in, Clerk collects and stores your{" "}
              <TypographyMark>
                name, email address, username, and profile picture
              </TypographyMark>{" "}
              depending on the OAuth provider you use (GitHub, Google, etc.).
              This data is stored on Clerk&apos;s infrastructure and is subject
              to{" "}
              <a
                href="https://clerk.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="link-external"
              >
                Clerk&apos;s Privacy Policy
              </a>
              . This site only stores the opaque Clerk user ID in its own
              database. Clerk uses{" "}
              <TypographyMark>session cookies</TypographyMark> to maintain your
              signed-in state. These are set only when you sign in to the
              guestbook or the blog comments section.
            </TypographyP>
          </div>
          <div className="space-y-2">
            <TypographyH2 className="border-b border-border pb-2">Cloudinary</TypographyH2>
            <TypographyP>
              Video in blog posts streams directly from{" "}
              <a
                href="https://cloudinary.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link-external"
              >
                Cloudinary
              </a>
              . Playing one connects your browser to Cloudinary, which sees
              your <TypographyMark>IP address and user agent</TypographyMark>{" "}
              the way any site you visit does. Images are handled differently:
              they are optimised and served from this domain, so viewing a post
              involves no third party until you press play.
            </TypographyP>
          </div>
          <div className="space-y-2">
            <TypographyH2 className="border-b border-border pb-2">Fonts &amp; GitHub</TypographyH2>
            <TypographyP>
              Fonts are <TypographyMark>self-hosted</TypographyMark>. They are
              downloaded at build time and served from this domain, so your
              browser never contacts Google to render this page. The resume is
              fetched from GitHub Releases by the server and passed through{" "}
              <TypographyMark>/api/resume</TypographyMark>, so GitHub never
              sees your request either.
            </TypographyP>
          </div>
        </div>
      </Section>

      <Section aria-label="Your rights">
        <SectionHeader>Your rights</SectionHeader>
        <div className="max-w-2xl space-y-4">
          <TypographyP>
            If you have never signed in to the guestbook or comments, the only
            data stored is an{" "}
            <TypographyMark>irreversible IP hash</TypographyMark>, and there is
            no practical way to identify or retrieve those records.
          </TypographyP>
          <TypographyP>
            If you have signed in and left a guestbook message, posted a
            comment, or liked either, you can request deletion of that data by
            emailing{" "}
            <a href={`mailto:${siteConfig.email}`} className="link-external">
              {siteConfig.email}
            </a>
            . To delete your Clerk account and the profile data Clerk holds
            (name, email, avatar), you can do so directly through the{" "}
            <TypographyMark>guestbook or comments sign-in page</TypographyMark>{" "}
            or by contacting me at the email above. Depending on your
            jurisdiction, you may have rights to access, correct, or erase your
            personal data under laws such as{" "}
            <TypographyMark>GDPR (EU)</TypographyMark> or{" "}
            <TypographyMark>CCPA (California)</TypographyMark>.
          </TypographyP>
        </div>
      </Section>

      <Section aria-label="Changes to this policy">
        <SectionHeader>Changes to this policy</SectionHeader>
        <div className="max-w-2xl">
          <TypographyP>
            If anything meaningful changes (like adding analytics), this page
            will be updated and the{" "}
            <TypographyMark>&ldquo;Last updated&rdquo;</TypographyMark> date
            will reflect it.
          </TypographyP>
        </div>
      </Section>
    </>
  );
}

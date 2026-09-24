import { Contact } from "@/app/(site)/_components/contact";
import { Hero } from "@/app/(site)/_components/hero";
import { BuiltThings } from "@/app/(site)/_components/projects";
import { RulesIFollow } from "@/app/(site)/_components/rules";
import { BlogTeaser } from "@/app/(site)/_components/blog-teaser";
import { GuestbookTeaser } from "@/app/(site)/_components/guestbook-teaser";
import { JsonLd } from "@/components/shared/json-ld";
import { Section } from "@/components/layouts/page";
import { siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = buildMeta({
  title: siteConfig.name,
  pageTitle: `${siteConfig.name} - ${siteConfig.role}`,
  description: siteConfig.description,
  path: "home",
  canonicalPath: "/",
  type: "profile",
});

export default function Page() {
  return (
    <>
      <JsonLd
        type="webpage"
        title={siteConfig.name}
        description={siteConfig.description}
        canonicalUrl={`${siteConfig.baseUrl}`}
      />
      <Hero />
      <BuiltThings />
      <RulesIFollow />
      <BlogTeaser />
      <Suspense
        fallback={
          <Section aria-hidden="true" className="animate-pulse">
            <div className="h-5 w-80 max-w-full rounded bg-muted" />
            <div className="h-20 rounded-md bg-muted/50" />
            <div className="h-9 w-40 rounded-md bg-muted" />
          </Section>
        }
      >
        <GuestbookTeaser />
      </Suspense>
      <Contact />
    </>
  );
}

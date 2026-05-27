import { Contact } from "@/app/(site)/_components/contact";
import { Hero } from "@/app/(site)/_components/hero";
import { BuiltThings } from "@/app/(site)/_components/projects";
import { RulesIFollow } from "@/app/(site)/_components/rules";
import { BlogTeaser } from "@/app/(site)/_components/blog-teaser";
import { GuestbookTeaser } from "@/app/(site)/_components/guestbook-teaser";
import { JsonLd } from "@/components/shared/json-ld";
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
      <RulesIFollow />
      <BuiltThings />
      <BlogTeaser />
      <Suspense
        fallback={
          <div className="flex flex-col gap-6 px-6 sm:px-8 lg:px-10 pb-12 pt-10 animate-pulse">
            <div className="h-3 w-24 rounded-full bg-muted" />
            <div className="h-5 w-80 rounded bg-muted" />
            <div className="h-20 rounded-md bg-muted/50" />
            <div className="h-9 w-40 rounded-md bg-muted" />
          </div>
        }
      >
        <GuestbookTeaser />
      </Suspense>
      <Contact />
    </>
  );
}

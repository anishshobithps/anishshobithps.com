import { Contact } from "@/app/(site)/_components/contact";
import { Hero } from "@/app/(site)/_components/hero";
import { BuiltThings } from "@/app/(site)/_components/projects";
import { RulesIFollow } from "@/app/(site)/_components/rules";
import { BlogTeaser } from "@/app/(site)/_components/blog-teaser";
import { GuestbookTeaser } from "@/app/(site)/_components/guestbook-teaser";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@repo/site-config";
import { buildMeta } from "@/lib/metadata";
import type { Metadata } from "next";

const homeTitle = `${siteConfig.name} – ${siteConfig.role}`;

export const metadata: Metadata = {
  ...buildMeta({
    title: siteConfig.name,
    pageTitle: homeTitle,
    description: siteConfig.description,
    path: "home",
    canonicalPath: "/",
    type: "profile",
  }),
  title: { absolute: homeTitle },
};

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
      <BlogTeaser />
      <RulesIFollow />
      <GuestbookTeaser />
      <Contact />
    </>
  );
}

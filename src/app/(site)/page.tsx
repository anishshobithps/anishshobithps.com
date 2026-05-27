import { Contact } from "@/app/(site)/_components/contact";
import { Ecosystem } from "@/app/(site)/_components/ecosystem";
import { Hero } from "@/app/(site)/_components/hero";
import { BuiltThings } from "@/app/(site)/_components/projects";
import { RulesIFollow } from "@/app/(site)/_components/rules";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/metadata";
import type { Metadata } from "next";

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
      <Ecosystem />
      <Contact />
    </>
  );
}

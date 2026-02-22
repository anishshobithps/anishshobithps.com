import { siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/og";
import type { Metadata } from "next";
import { Contact } from "./_components/contact";
import { Hero } from "./_components/hero";
import { RulesIFollow } from "./_components/rules";
import { BuiltThings } from "./_components/projects";
import { Ecosystem } from "./_components/ecosystem";
import { JsonLd } from "@/components/shared/json-ld";

export const metadata: Metadata = buildMeta({
  title: siteConfig.name,
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

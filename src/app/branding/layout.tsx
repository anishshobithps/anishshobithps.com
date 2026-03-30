import { buildMeta } from "@/lib/metadata";
import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = buildMeta({
  title: "Branding",
  pageTitle: "Branding",
  description: `${siteConfig.name}'s brand system — typography, logo variants, and open graph previews.`,
  path: "home / branding",
  canonicalPath: "/branding",
  type: "website",
  noIndex: true,
});

export default function BrandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

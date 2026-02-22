import { buildMeta } from "@/lib/og";
import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = buildMeta({
  title: "Resume",
  pageTitle: "Resume",
  description: `${siteConfig.name}'s resume — professional experience, projects, and technical expertise.`,
  path: "home / resume",
  canonicalPath: "/resume",
  type: "profile",
});

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import { Content, PageLayout } from "@/components/layouts/page";
import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { JsonLd } from "@/components/shared/json-ld";
import { MouseGlow } from "@/components/shared/mouse-glow";
import { PhosphorProvider } from "@/components/shared/phosphor-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/lib/config";
import { ClerkProvider } from "@clerk/nextjs";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "./global.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.role}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.baseUrl),
  icons: {
    icon: [
      {
        url: "/favicon-dark.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon-light.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${plusJakartaSans.className} ${geistMono.className} antialiased`}
        suppressHydrationWarning
      >
        <body className="relative flex flex-col min-h-screen">
          {process.env.NODE_ENV === "production" && (
            <Script
              src="/stats/script.js"
              data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
              data-host-url="/stats"
              strategy="afterInteractive"
            />
          )}
          <JsonLd type="person" />
          <JsonLd type="website" />
          <RootProvider>
            <NuqsAdapter>
              <PageLayout>
                <Header />
                <Content className="scroll-smooth pt-14">
                  <TooltipProvider>
                    <PhosphorProvider>{children}</PhosphorProvider>
                    <Toaster />
                  </TooltipProvider>
                </Content>
                <Footer />
              </PageLayout>
            </NuqsAdapter>
          </RootProvider>
          <MouseGlow />
        </body>
      </html>
    </ClerkProvider>
  );
}

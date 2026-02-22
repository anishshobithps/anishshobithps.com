import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { Content, PageLayout } from "@/components/layouts/page";
import { siteConfig } from "@/lib/config";
import { buildOGMeta } from "@/lib/og";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./global.css";
import { MouseGlow } from "@/components/shared/mouse-glow";
import { TooltipProvider } from "@/components/ui/tooltip";
import { JsonLd } from "@/components/shared/json-ld";

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
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.baseUrl),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon",
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.className} ${geistMono.className} antialiased`}
      suppressHydrationWarning
    >
      <body className="relative flex flex-col min-h-screen">
        <JsonLd type="person" />
        <JsonLd type="website" />
        <RootProvider>
          <NuqsAdapter>
            <PageLayout>
              <Header />
              <Content className="scroll-smooth">
                <TooltipProvider>{children}</TooltipProvider>
              </Content>
              <Footer />
            </PageLayout>
          </NuqsAdapter>
        </RootProvider>
        <MouseGlow />
      </body>
    </html>
  );
}

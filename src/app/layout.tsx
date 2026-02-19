import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Content, PageLayout } from "@/components/layouts/page";
import { siteConfig } from "@/lib/config";
import { buildOGMeta } from "@/lib/og";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { Metadata } from "next";
import "./global.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.baseUrl),
  ...buildOGMeta({ path: "home", title: siteConfig.name }),
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.className} antialiased`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <PageLayout>
            <Header />
            <Content className="scroll-smooth">{children}</Content>
            <Footer />
          </PageLayout>
        </RootProvider>
      </body>
    </html>
  );
}

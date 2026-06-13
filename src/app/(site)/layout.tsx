import { Content, PageLayout } from "@/components/layouts/page";
import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { JsonLd } from "@/components/shared/json-ld";
import { MouseGlow } from "@/components/shared/mouse-glow";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd type="person" />
      <JsonLd type="website" />
      <PageLayout>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-background focus:border focus:border-border focus:rounded-md focus:text-foreground focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <Header />
        <Content id="main-content" className="scroll-smooth pt-14">
          {children}
        </Content>
        <Footer />
      </PageLayout>
      <MouseGlow />
    </>
  );
}

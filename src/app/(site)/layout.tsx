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
        <Header />
        <Content className="scroll-smooth pt-14">{children}</Content>
        <Footer />
      </PageLayout>
      <MouseGlow />
    </>
  );
}

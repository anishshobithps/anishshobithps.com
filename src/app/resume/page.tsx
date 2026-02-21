import { Section } from "@/components/layouts/page";
import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
} from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import {
  PdfViewer,
  PdfViewerControls,
  PdfViewerDownload,
  PdfViewerFilename,
  PdfViewerFooter,
  PdfViewerOpen,
  PdfViewerPagination,
  PdfViewerReload,
  PdfViewerToolbar,
  PdfViewerZoom,
} from "@/components/ui/pdf-viewer";
import { getResumeFilename } from "@/lib/resume";
import { LogoLoader } from "@/components/shared/loader";

export const metadata = {
  title: "Resume",
};

export default function ResumePage() {
  const filename = getResumeFilename();

  return (
    <>
      <Section variant="hero">
        <TypographyH1>Resume</TypographyH1>
        <TypographyLead>
          Professional experience, projects, and technical expertise.
        </TypographyLead>
      </Section>

      <Section noTopDivider innerPadding="pt-6 pb-10 xl:pb-14">
        <PdfViewer
          file="/api/resume"
          downloadHref="/api/resume/download"
          loader={
            <div className="flex h-full items-center justify-center">
              <LogoLoader />
            </div>
          }
        >
          <PdfViewerToolbar>
            <PdfViewerFilename name={filename} />
            <PdfViewerControls>
              <PdfViewerPagination />
              <PdfViewerZoom />
              <PdfViewerReload />
              <PdfViewerOpen />
              <PdfViewerDownload label="Download" />
            </PdfViewerControls>
          </PdfViewerToolbar>

          <PdfViewerFooter>
            <TypographyMuted className="font-mono text-[11px] tracking-wide">
              ETag · Last-Modified · Content-Length
            </TypographyMuted>
          </PdfViewerFooter>
        </PdfViewer>
      </Section>
    </>
  );
}

import { Section } from "@/components/layouts/page";
import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
  TypographyMark,
} from "@/components/ui/typography";
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
import { buildMeta } from "@/lib/og";
import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";
import { JsonLd } from "@/components/shared/json-ld";

export const metadata: Metadata = buildMeta({
  title: "Resume",
  pageTitle: "Professional Resume",
  description: `${siteConfig.name}'s resume — professional experience, projects, and technical expertise. Full-stack engineer building modern web applications.`,
  path: "home / resume",
  canonicalPath: "/resume",
  type: "profile",
});

export default function ResumePage() {
  const filename = getResumeFilename();

  return (
    <>
      <JsonLd
        type="webpage"
        title="Resume"
        description={`${siteConfig.name}'s resume — professional experience, projects, and technical expertise.`}
        canonicalUrl={`${siteConfig.baseUrl}/resume`}
      />
      <Section variant="hero" aria-label="Resume">
        <TypographyH1>Resume</TypographyH1>
        <TypographyLead>
          Professional experience, projects, and{" "}
          <TypographyMark>technical expertise</TypographyMark>.
        </TypographyLead>
      </Section>

      <Section noTopDivider innerPadding="pt-12" aria-label="Resume document">
        <PdfViewer
          file="/api/resume"
          downloadHref="/api/resume/download"
          aria-label={`Resume PDF: ${filename}`}
          loader={
            <div
              className="flex h-full items-center justify-center"
              role="status"
              aria-label="Loading resume"
            >
              <LogoLoader aria-hidden="true" />
            </div>
          }
        >
          <PdfViewerToolbar aria-label="PDF viewer controls">
            <PdfViewerFilename
              name={filename}
              aria-label={`File: ${filename}`}
            />
            <PdfViewerControls>
              <PdfViewerPagination aria-label="Page navigation" />
              <PdfViewerZoom aria-label="Zoom controls" />
              <PdfViewerReload aria-label="Reload PDF" />
              <PdfViewerOpen aria-label="Open PDF in new tab" />
              <PdfViewerDownload
                label="Download"
                aria-label="Download resume as PDF"
              />
            </PdfViewerControls>
          </PdfViewerToolbar>

          <PdfViewerFooter>
            <TypographyMuted
              className="font-mono text-[11px] tracking-wide"
              aria-label="File metadata: ETag, Last-Modified, Content-Length"
            >
              ETag · Last-Modified · Content-Length
            </TypographyMuted>
          </PdfViewerFooter>
        </PdfViewer>
      </Section>
    </>
  );
}

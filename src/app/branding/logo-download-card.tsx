"use client";

import { Logo, type LogoProps } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { CodeXmlIcon, ImageIcon } from "lucide-react";
import { useRef, useState } from "react";

const DOWNLOAD_SIZES = [16, 32, 64, 128, 256, 512] as const;
type DownloadSize = (typeof DOWNLOAD_SIZES)[number];

interface LogoDownloadCardProps {
  label: string;
  description: string;
  logoProps: Omit<LogoProps, "ref">;
}

function getSVGString(svg: SVGSVGElement, targetHeight: number): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("color", "#000000");
  const vb = svg.viewBox.baseVal;
  const aspectRatio = vb.width / vb.height;
  clone.setAttribute("width", String(Math.round(targetHeight * aspectRatio)));
  clone.setAttribute("height", String(targetHeight));
  clone.querySelectorAll(".fill-current").forEach((el) => {
    (el as SVGElement).removeAttribute("class");
    (el as SVGElement).setAttribute("fill", "currentColor");
  });
  return new XMLSerializer().serializeToString(clone);
}

function downloadSVG(svg: SVGSVGElement, filename: string, size: number) {
  const svgStr = getSVGString(svg, size);
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPNG(svg: SVGSVGElement, filename: string, size: number) {
  const vb = svg.viewBox.baseVal;
  const aspectRatio = vb.width / vb.height;
  const w = Math.round(size * aspectRatio);
  const h = size;
  const svgStr = getSVGString(svg, size);
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${filename}.png`;
    a.click();
  };
  img.src = url;
}

export function LogoDownloadCard({
  label,
  description,
  logoProps,
}: LogoDownloadCardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<DownloadSize>(64);

  const nameSlug = siteConfig.name.toLowerCase().replace(/\s+/g, "-");
  const variantSlug = label.toLowerCase().replace(/\s+/g, "-");
  const filename = `${nameSlug}-${variantSlug}-${size}px`;

  return (
    <div className="flex flex-col gap-3 w-full" aria-label={`${label} logo variant`}>
      <div>
        <TypographyMuted className="text-xs uppercase tracking-wider" aria-hidden="true">
          {label}
        </TypographyMuted>
        <TypographySmall className="text-muted-foreground">
          {description}
        </TypographySmall>
      </div>

      <div
        className="flex items-center justify-center w-full min-h-28 rounded-sm border border-border/60 bg-muted/20 px-6 py-8"
        role="img"
        aria-label={`${label} logo preview`}
      >
        <Logo ref={svgRef} size={48} aria-hidden="true" {...logoProps} />
      </div>

      <div className="flex items-center gap-2" aria-label={`Download ${label} logo`}>
        <Select
          value={String(size)}
          onValueChange={(v) => setSize(Number(v) as DownloadSize)}
        >
          <SelectTrigger
            className="h-8 w-24 shrink-0 text-xs"
            aria-label={`Select download size, currently ${size}px`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOWNLOAD_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)} className="text-xs">
                {s} px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 gap-1.5 text-xs"
          aria-label={`Download ${label} logo as SVG at ${size}px`}
          onClick={() => svgRef.current && downloadSVG(svgRef.current, filename, size)}
        >
          <CodeXmlIcon className="size-3 shrink-0" aria-hidden="true" />
          SVG
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 gap-1.5 text-xs"
          aria-label={`Download ${label} logo as PNG at ${size}px`}
          onClick={() => svgRef.current && downloadPNG(svgRef.current, filename, size)}
        >
          <ImageIcon className="size-3 shrink-0" aria-hidden="true" />
          PNG
        </Button>
      </div>
    </div>
  );
}

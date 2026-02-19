"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo, type LogoProps } from "@/components/logo";
import { TypographySmall, TypographyMuted } from "@/components/ui/typography";
import { ImageIcon, CodeXmlIcon } from "lucide-react";
import { siteConfig } from "@/lib/config";

const DOWNLOAD_SIZES = [16, 32, 64, 128, 256, 512] as const;
type DownloadSize = (typeof DOWNLOAD_SIZES)[number];

interface LogoDownloadCardProps {
  label: string;
  description: string;
  logoProps: Omit<LogoProps, "size">;
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
    <div className="rounded-xl border overflow-hidden">
      <div className="flex items-center justify-center h-36 bg-muted/20 px-10">
        <Logo ref={svgRef} size={56} {...logoProps} copyOnClick />
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3 border-t bg-muted/10">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <TypographySmall className="font-semibold">{label}</TypographySmall>
            <TypographyMuted className="text-xs truncate">
              {description}
            </TypographyMuted>
          </div>
          <Select
            value={String(size)}
            onValueChange={(v) => setSize(Number(v) as DownloadSize)}
          >
            <SelectTrigger size="sm" className="w-24 shrink-0 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOWNLOAD_SIZES.map((s) => (
                <SelectItem
                  key={s}
                  value={String(s)}
                  className="cursor-pointer"
                >
                  {s} px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1.5">
          <Button
            size="xs"
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={() =>
              svgRef.current && downloadSVG(svgRef.current, filename, size)
            }
          >
            <CodeXmlIcon />
            SVG
          </Button>
          <Button
            size="xs"
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={() =>
              svgRef.current && downloadPNG(svgRef.current, filename, size)
            }
          >
            <ImageIcon />
            PNG
          </Button>
        </div>
      </div>
    </div>
  );
}

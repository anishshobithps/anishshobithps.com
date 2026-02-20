import { Eye } from "lucide-react";
import { TypographyMuted } from "@/components/ui/typography";
import { trackRead, getBlogReadsCount } from "./actions";

export async function BlogReadsInfo({ slug }: { slug: string }) {
  await trackRead(slug);
  const reads = await getBlogReadsCount(slug);
  return (
    <TypographyMuted className="font-mono text-xs flex items-center gap-1.5">
      <Eye className="size-3.5 shrink-0" />
      {reads} reads
    </TypographyMuted>
  );
}

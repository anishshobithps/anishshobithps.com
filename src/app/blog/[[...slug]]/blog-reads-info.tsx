import { getBlogReadsCount, trackRead } from "@/app/blog/[[...slug]]/actions";
import { TypographyMuted } from "@/components/ui/typography";
import { Eye } from "lucide-react";

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

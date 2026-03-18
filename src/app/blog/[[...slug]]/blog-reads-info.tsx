import { getBlogReadsCount, trackRead } from "@/app/blog/[[...slug]]/actions";
import { TypographyMuted } from "@/components/ui/typography";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr";

export async function BlogReadsInfo({ slug }: { slug: string }) {
  const [reads] = await Promise.all([getBlogReadsCount(slug), trackRead(slug)]);
  return (
    <TypographyMuted
      className="font-mono tabular-nums text-xs flex items-center gap-1.5"
      aria-label={`${reads} reads`}
    >
      <EyeIcon className="size-3.5 shrink-0" aria-hidden="true" />
      {reads} reads
    </TypographyMuted>
  );
}

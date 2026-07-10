import { getComments } from "@/app/(site)/blog/[[...slug]]/actions";
import { PostEngagement } from "@/app/(site)/blog/[[...slug]]/_components/post-engagement";

export async function CommentsSection({
  slug,
  currentUserId,
}: {
  slug: string;
  currentUserId: string | null;
}) {
  const { comments } = await getComments(slug);
  return (
    <PostEngagement
      slug={slug}
      initialComments={comments}
      currentUserId={currentUserId}
    />
  );
}

export function CommentsFallback() {
  return (
    <div className="space-y-8" aria-hidden="true">
      <div className="h-44 rounded-md border border-border/40 bg-muted/20 animate-pulse" />
      <div className="h-64 rounded-md border border-border/40 bg-muted/20 animate-pulse" />
    </div>
  );
}

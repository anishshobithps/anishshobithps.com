import { getLatestPost } from "@/lib/source";

export const revalidate = false;

export function GET() {
  const latest = getLatestPost();
  return new Response(null, {
    status: 307,
    headers: { Location: latest?.url ?? "/blogs" },
  });
}

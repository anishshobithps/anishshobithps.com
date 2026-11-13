import { NextResponse } from "next/server";
import { getPostBundle } from "@/app/(site)/blog/[[...slug]]/actions";

export async function POST(request: Request) {
  let slug: unknown;
  try {
    ({ slug } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof slug !== "string" || slug.length === 0 || slug.length > 256) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  return NextResponse.json(await getPostBundle(slug), {
    headers: { "Cache-Control": "no-store" },
  });
}

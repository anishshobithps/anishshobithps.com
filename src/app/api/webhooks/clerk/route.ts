import { db } from "@/lib/db";
import { guestbookEntries, guestbookLikes } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { Webhook } from "svix";

type UserDeletedEvent = {
    type: "user.deleted";
    data: { id: string; deleted: boolean };
};

export async function POST(req: Request) {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
        return new Response("CLERK_WEBHOOK_SECRET not set", { status: 500 });
    }

    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
        return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await req.text();

    const wh = new Webhook(secret);
    let event: UserDeletedEvent;
    try {
        event = wh.verify(payload, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        }) as UserDeletedEvent;
    } catch {
        return new Response("Invalid webhook signature", { status: 400 });
    }

    if (event.type === "user.deleted" && event.data.id) {
        const userId = event.data.id;
        await db
            .delete(guestbookLikes)
            .where(eq(guestbookLikes.clerkUserId, userId));
        await db
            .delete(guestbookEntries)
            .where(eq(guestbookEntries.clerkUserId, userId));
    }

    return new Response(null, { status: 200 });
}

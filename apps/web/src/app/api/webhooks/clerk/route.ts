import { ENV } from "varlock/env";
import { db } from "@repo/db";
import {
    blogCommentLikes,
    blogComments,
    guestbookEntries,
    guestbookLikes,
} from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { clerkUserTag } from "@/lib/clerk-users";

type UserDeletedEvent = {
    type: "user.deleted";
    data: { id: string; deleted: boolean };
};

type UserUpdatedEvent = {
    type: "user.updated";
    data: { id: string };
};

type ClerkWebhookEvent = UserDeletedEvent | UserUpdatedEvent;

export async function POST(req: Request) {
    const secret = ENV.CLERK_WEBHOOK_SECRET;
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
    let event: ClerkWebhookEvent;
    try {
        wh.verify(payload, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        });
        event = JSON.parse(payload) as ClerkWebhookEvent;
    } catch {
        return new Response("Invalid webhook signature", { status: 400 });
    }

    if (event.type === "user.deleted" && event.data.id) {
        const userId = event.data.id;
        await db.batch([
            db.delete(guestbookLikes).where(eq(guestbookLikes.clerkUserId, userId)),
            db.delete(guestbookEntries).where(eq(guestbookEntries.clerkUserId, userId)),
            db.delete(blogCommentLikes).where(eq(blogCommentLikes.clerkUserId, userId)),
            db.delete(blogComments).where(eq(blogComments.clerkUserId, userId)),
        ]);
    }

    if (event.type === "user.updated" && event.data.id) {
        revalidateTag(clerkUserTag(event.data.id), "max");
    }

    return new Response(null, { status: 200 });
}

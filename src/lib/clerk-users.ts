import { clerkClient } from "@clerk/nextjs/server";

/**
 * A minimal, serialisable view of a Clerk user, shared by the guestbook and
 * blog-comment features (and their admin panels).
 */
export interface PublicUser {
    id: string;
    name: string;
    username: string | null;
    imageUrl: string;
}

/** Resolve a display name from Clerk's name fields, with sensible fallbacks. */
function resolveUserName(user: {
    firstName: string | null;
    lastName: string | null;
    username: string | null;
}): string {
    return (
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username ||
        "Anonymous"
    );
}

/**
 * Fetch the given Clerk users in a single request and return a lookup map.
 * De-duplicates ids and short-circuits when there is nothing to fetch.
 */
export async function getClerkUserMap(
    userIds: string[],
): Promise<Map<string, PublicUser>> {
    const uniqueIds = [...new Set(userIds)];
    if (uniqueIds.length === 0) return new Map();

    const client = await clerkClient();
    const { data } = await client.users.getUserList({ userId: uniqueIds, limit: 500 });

    return new Map(
        data.map((u) => [
            u.id,
            {
                id: u.id,
                name: resolveUserName(u),
                username: u.username,
                imageUrl: u.imageUrl,
            } satisfies PublicUser,
        ]),
    );
}

/** Look up a user, falling back to a placeholder for unknown/deleted accounts. */
export function resolveUser(map: Map<string, PublicUser>, id: string): PublicUser {
    return map.get(id) ?? { id, name: "Unknown User", username: null, imageUrl: "" };
}

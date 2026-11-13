import { ENV } from "varlock/env";
import { createClerkClient } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";

export interface PublicUser {
    id: string;
    name: string;
    username: string | null;
    imageUrl: string;
}

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

let backendClient: ReturnType<typeof createClerkClient> | null = null;

function getBackendClient() {
    backendClient ??= createClerkClient({ secretKey: ENV.CLERK_SECRET_KEY });
    return backendClient;
}

export const CLERK_USERS_TAG = "clerk-users";

export function clerkUserTag(id: string): string {
    return `clerk-user:${id}`;
}

const CLERK_USERS_TTL_SECONDS = 600;

async function fetchPublicUsers(ids: string[]): Promise<PublicUser[]> {
    const { data } = await getBackendClient().users.getUserList({
        userId: ids,
        limit: 500,
    });

    return data.map(
        (u) =>
            ({
                id: u.id,
                name: resolveUserName(u),
                username: u.username,
                imageUrl: u.imageUrl,
            }) satisfies PublicUser,
    );
}

export async function getClerkUserMap(
    userIds: string[],
): Promise<Map<string, PublicUser>> {
    const uniqueIds = [...new Set(userIds)].sort();
    if (uniqueIds.length === 0) return new Map();

    const load = unstable_cache(
        () => fetchPublicUsers(uniqueIds),
        ["clerk-users", uniqueIds.join(",")],
        {
            revalidate: CLERK_USERS_TTL_SECONDS,
            tags: [CLERK_USERS_TAG, ...uniqueIds.map(clerkUserTag)],
        },
    );

    const users = await load();
    return new Map(users.map((user) => [user.id, user]));
}

export function resolveUser(map: Map<string, PublicUser>, id: string): PublicUser {
    return map.get(id) ?? { id, name: "Unknown User", username: null, imageUrl: "" };
}

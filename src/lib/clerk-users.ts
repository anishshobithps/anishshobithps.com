import { clerkClient } from "@clerk/nextjs/server";

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

export function resolveUser(map: Map<string, PublicUser>, id: string): PublicUser {
    return map.get(id) ?? { id, name: "Unknown User", username: null, imageUrl: "" };
}

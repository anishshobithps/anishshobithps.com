import { auth } from "@clerk/nextjs/server";

export async function assertAdmin(): Promise<void> {
    const { userId } = await auth();
    if (userId !== process.env.OWNER_CLERK_USER_ID) {
        throw new Error("Unauthorized");
    }
}

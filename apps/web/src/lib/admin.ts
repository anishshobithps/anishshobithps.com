import { ENV } from "varlock/env";
import { auth } from "@clerk/nextjs/server";
import type { ActionResult } from "@repo/core/action-result";

export async function assertAdmin(): Promise<void> {
  const { userId } = await auth();
  if (userId !== ENV.OWNER_CLERK_USER_ID) {
    throw new Error("Unauthorized");
  }
}

export async function adminMutation(
  action: string,
  run: () => Promise<string | void>,
  revalidate?: () => void,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const failure = await run();
    if (failure) return { success: false, error: failure };
    revalidate?.();
    return { success: true };
  } catch {
    return { success: false, error: `Failed to ${action}.` };
  }
}

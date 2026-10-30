import { assertAdmin } from "@/lib/assert-admin";
import type { ActionResult } from "@/lib/action-result";

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

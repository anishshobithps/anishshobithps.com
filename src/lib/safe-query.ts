import { unstable_rethrow } from "next/navigation";

export async function safeQuery<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    unstable_rethrow(error);
    console.error(`Database read failed (${label}):`, error);
    return fallback;
  }
}

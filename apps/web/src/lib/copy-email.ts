import { siteConfig } from "@repo/core/site-config";
import { playCue } from "@repo/sounds/sound-player";
import { toast } from "@/lib/toast";
import { track } from "@/lib/analytics/events";

export async function copyEmail(location: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(siteConfig.email);
    track("email_copied", { success: true, location });
    playCue("copy");
    toast.success("Email copied", { description: siteConfig.email });
    return true;
  } catch {
    track("email_copied", { success: false, location });
    toast.error("Couldn't reach the clipboard", {
      description: `The address is ${siteConfig.email}`,
    });
    return false;
  }
}

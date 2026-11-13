import { siteConfig } from "@repo/site-config";
import { playCue } from "@repo/sounds/sound-player";
import { toast } from "@/lib/toast";

export async function copyEmail(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(siteConfig.email);
    playCue("copy");
    toast.success("Email copied", { description: siteConfig.email });
    return true;
  } catch {
    toast.error("Couldn't reach the clipboard", {
      description: `The address is ${siteConfig.email}`,
    });
    return false;
  }
}

import { fetchJson, num, str } from "@/lib/link-preview/http";
import type { LinkPreview } from "@/lib/link-preview/types";

export async function resolveNpm(name: string, url: string): Promise<LinkPreview | null> {
  const registryName = name.startsWith("@") ? name.replaceAll("/", "%2F") : name;
  const [pkg, downloads] = await Promise.all([
    fetchJson(`https://registry.npmjs.org/${registryName}/latest`),
    fetchJson(`https://api.npmjs.org/downloads/point/last-week/${name}`),
  ]);

  const version = str(pkg?.version);
  if (!pkg || !version) return null;

  return {
    kind: "npm",
    url,
    name,
    version,
    description: str(pkg.description),
    license: str(pkg.license),
    weeklyDownloads: num(downloads?.downloads),
  };
}

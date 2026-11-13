import { fetchJson, num, str } from "@/lib/link-preview/http";
import type { LinkPreview } from "@/lib/link-preview/types";

export async function resolveDiscord(code: string, url: string): Promise<LinkPreview | null> {
  const data = await fetchJson(
    `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`,
  );
  const guild =
    data?.guild && typeof data.guild === "object"
      ? (data.guild as Record<string, unknown>)
      : null;
  const name = str(guild?.name);
  if (!data || !guild || !name) return null;

  const guildId = str(guild.id);
  const icon = str(guild.icon);

  return {
    kind: "discord-invite",
    url,
    name,
    iconUrl:
      guildId && icon
        ? `https://cdn.discordapp.com/icons/${guildId}/${icon}.png?size=128`
        : null,
    members: num(data.approximate_member_count),
    online: num(data.approximate_presence_count),
  };
}

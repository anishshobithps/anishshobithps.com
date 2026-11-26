import posthog from "posthog-js";

export interface AnalyticsEvents {
  theme_changed: { theme: string };
  sound_toggled: { enabled: boolean };
  motion_changed: { setting: string };
  link_previews_toggled: { enabled: boolean };
  command_menu_opened: Record<string, never>;
  command_menu_command: { command: string; target?: string };
  email_copied: { success: boolean; location: string };
  outbound_link_clicked: {
    href: string;
    host: string;
    protocol: string;
    label: string | null;
  };
  logo_downloaded: { format: "svg" | "png"; size: number; filename: string };
  blog_list_filtered: { query: string; tags: string[]; results: number };
  post_read: { slug: string };
  post_finished: { slug: string };
  post_reaction_set: { slug: string; mood: string | null };
  comment_posted: { slug: string; is_reply: boolean; length: number };
  comment_deleted: { slug: string };
  comment_like_toggled: { slug: string; liked: boolean };
  guestbook_signed: { length: number };
  guestbook_entry_deleted: Record<string, never>;
  guestbook_like_toggled: { liked: boolean };
  sign_in_opened: { pathname: string };
  signed_out: { pathname: string };
}

export interface ServerAnalyticsEvents {
  short_link_followed: {
    slug: string;
    tag: string;
    permanent: boolean;
    has_preview: boolean;
    target_host: string | null;
    referrer_host: string | null;
  };
  resume_downloaded: { referrer_host: string | null };
}

export function track<E extends keyof AnalyticsEvents>(
  event: E,
  ...[properties]: AnalyticsEvents[E] extends Record<string, never>
    ? []
    : [AnalyticsEvents[E]]
): void {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  posthog.capture(event, properties);
}

export interface AnalyticsIdentity {
  id: string;
  username: string | null;
  fullName: string | null;
}

export function syncIdentity(user: AnalyticsIdentity | null): void {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  if (user) {
    posthog.identify(user.id, {
      username: user.username,
      name: user.fullName,
    });
    return;
  }
  if (posthog.get_property("$user_state") === "identified") posthog.reset();
}

export function registerContext(properties: Record<string, string | boolean>) {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  posthog.register(properties);
}

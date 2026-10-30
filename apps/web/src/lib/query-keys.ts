export const queryKeys = {
  guestbook: ["guestbook"] as const,
  nowPlaying: ["now-playing"] as const,
  reactions: (slug: string) => ["reactions", slug] as const,
  admin: {
    stats: ["admin", "stats"] as const,
    links: ["admin", "links"] as const,
    projects: ["admin", "projects"] as const,
    comments: ["admin", "comments"] as const,
    guestbook: ["admin", "guestbook"] as const,
  },
} as const;

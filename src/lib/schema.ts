import {
    pgTable,
    varchar,
    timestamp,
    primaryKey,
    index,
    serial,
    boolean,
    text,
    integer
} from "drizzle-orm/pg-core";

export const blogReactions = pgTable(
    "blog_reactions",
    {
        slug: varchar("slug", { length: 256 }).notNull(),
        ipHash: varchar("ip_hash", { length: 64 }).notNull(),
        mood: varchar("mood", { length: 32 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.slug, table.ipHash] }),
        index("blog_reactions_slug_idx").on(table.slug),
    ],
);

export const blogReads = pgTable(
    "blog_reads",
    {
        slug: varchar("slug", { length: 256 }).notNull(),
        ipHash: varchar("ip_hash", { length: 64 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.slug, table.ipHash] }),
        index("blog_reads_slug_idx").on(table.slug),
    ],
);

export const guestbookEntries = pgTable(
    "guestbook_entries",
    {
        id: serial("id").primaryKey(),
        clerkUserId: varchar("clerk_user_id", { length: 256 }).notNull(),
        message: text("message").notNull(),
        isPinned: boolean("is_pinned").default(false).notNull(),
        isDeleted: boolean("is_deleted").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("guestbook_entries_clerk_user_idx").on(table.clerkUserId),
        index("guestbook_entries_created_at_idx").on(table.createdAt),
    ],
);

export const guestbookLikes = pgTable(
    "guestbook_likes",
    {
        entryId: integer("entry_id")
            .notNull()
            .references(() => guestbookEntries.id, { onDelete: "cascade" }),
        clerkUserId: varchar("clerk_user_id", { length: 256 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.entryId, table.clerkUserId] }),
        index("guestbook_likes_entry_idx").on(table.entryId),
    ],
);

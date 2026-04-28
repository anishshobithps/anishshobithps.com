import {
    pgTable,
    varchar,
    timestamp,
    primaryKey,
    index,
    serial,
    boolean,
    text,
    integer,
    unique,
} from "drizzle-orm/pg-core";

export const blogPosts = pgTable(
    "blog_posts",
    {
        id: serial("id").primaryKey(),
        slug: varchar("slug", { length: 256 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        unique("blog_posts_slug_unique").on(table.slug),
    ],
);

export const blogReactions = pgTable(
    "blog_reactions",
    {
        postId: integer("post_id")
            .notNull()
            .references(() => blogPosts.id, { onDelete: "cascade", onUpdate: "cascade" }),
        ipHash: varchar("ip_hash", { length: 64 }).notNull(),
        mood: varchar("mood", { length: 32 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.postId, table.ipHash] }),
        index("blog_reactions_post_idx").on(table.postId),
    ],
);

export const blogReads = pgTable(
    "blog_reads",
    {
        postId: integer("post_id")
            .notNull()
            .references(() => blogPosts.id, { onDelete: "cascade", onUpdate: "cascade" }),
        ipHash: varchar("ip_hash", { length: 64 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.postId, table.ipHash] }),
        index("blog_reads_post_idx").on(table.postId),
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

export const blogComments = pgTable(
    "blog_comments",
    {
        id: serial("id").primaryKey(),
        postId: integer("post_id")
            .notNull()
            .references(() => blogPosts.id, { onDelete: "cascade", onUpdate: "cascade" }),
        parentId: integer("parent_id"),
        clerkUserId: varchar("clerk_user_id", { length: 256 }).notNull(),
        body: text("body").notNull(),
        isPinned: boolean("is_pinned").default(false).notNull(),
        isDeleted: boolean("is_deleted").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("blog_comments_post_idx").on(table.postId),
        index("blog_comments_parent_idx").on(table.parentId),
        index("blog_comments_pinned_idx").on(table.isPinned),
    ],
);

export const blogCommentLikes = pgTable(
    "blog_comment_likes",
    {
        commentId: integer("comment_id")
            .notNull()
            .references(() => blogComments.id, { onDelete: "cascade" }),
        clerkUserId: varchar("clerk_user_id", { length: 256 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.commentId, table.clerkUserId] }),
        index("blog_comment_likes_comment_idx").on(table.commentId),
    ],
);

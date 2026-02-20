import {
    pgTable,
    varchar,
    timestamp,
    primaryKey,
    index,
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

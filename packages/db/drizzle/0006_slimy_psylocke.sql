BEGIN;

CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);

ALTER TABLE "blog_reactions" DROP CONSTRAINT "blog_reactions_slug_ip_hash_pk";
ALTER TABLE "blog_reads" DROP CONSTRAINT "blog_reads_slug_ip_hash_pk";

ALTER TABLE "blog_comments" ADD COLUMN "post_id" integer;
ALTER TABLE "blog_reactions" ADD COLUMN "post_id" integer;
ALTER TABLE "blog_reads" ADD COLUMN "post_id" integer;

INSERT INTO "blog_posts" ("slug", "created_at", "updated_at")
SELECT slug, MIN(created_at), MIN(created_at)
FROM (
    SELECT slug, created_at FROM blog_comments
    UNION ALL
    SELECT slug, created_at FROM blog_reactions
    UNION ALL
    SELECT slug, created_at FROM blog_reads
) t
GROUP BY slug;

UPDATE "blog_comments" SET "post_id" = bp.id FROM "blog_posts" bp WHERE bp.slug = "blog_comments".slug;
UPDATE "blog_reactions" SET "post_id" = bp.id FROM "blog_posts" bp WHERE bp.slug = "blog_reactions".slug;
UPDATE "blog_reads" SET "post_id" = bp.id FROM "blog_posts" bp WHERE bp.slug = "blog_reads".slug;

DO $$
DECLARE
    comments_null integer;
    reactions_null integer;
    reads_null integer;
BEGIN
    SELECT COUNT(*) INTO comments_null FROM blog_comments WHERE post_id IS NULL;
    SELECT COUNT(*) INTO reactions_null FROM blog_reactions WHERE post_id IS NULL;
    SELECT COUNT(*) INTO reads_null FROM blog_reads WHERE post_id IS NULL;

    IF comments_null > 0 OR reactions_null > 0 OR reads_null > 0 THEN
        RAISE EXCEPTION 'Backfill incomplete: comments=%, reactions=%, reads=%',
            comments_null, reactions_null, reads_null;
    END IF;
END $$;

ALTER TABLE "blog_comments" ALTER COLUMN "post_id" SET NOT NULL;
ALTER TABLE "blog_reactions" ALTER COLUMN "post_id" SET NOT NULL;
ALTER TABLE "blog_reads" ALTER COLUMN "post_id" SET NOT NULL;

ALTER TABLE "blog_reactions" ADD CONSTRAINT "blog_reactions_post_id_ip_hash_pk" PRIMARY KEY("post_id","ip_hash");
ALTER TABLE "blog_reads" ADD CONSTRAINT "blog_reads_post_id_ip_hash_pk" PRIMARY KEY("post_id","ip_hash");

ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "blog_reactions" ADD CONSTRAINT "blog_reactions_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "blog_reads" ADD CONSTRAINT "blog_reads_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE cascade;

CREATE INDEX "blog_comments_post_idx" ON "blog_comments" USING btree ("post_id");
CREATE INDEX "blog_reactions_post_idx" ON "blog_reactions" USING btree ("post_id");
CREATE INDEX "blog_reads_post_idx" ON "blog_reads" USING btree ("post_id");

ALTER TABLE "blog_comments" DROP COLUMN "slug";
ALTER TABLE "blog_reactions" DROP COLUMN "slug";
ALTER TABLE "blog_reads" DROP COLUMN "slug";

DROP INDEX IF EXISTS "blog_comments_slug_idx";
DROP INDEX IF EXISTS "blog_reactions_slug_idx";
DROP INDEX IF EXISTS "blog_reads_slug_idx";

COMMIT;

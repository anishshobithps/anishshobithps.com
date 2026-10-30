UPDATE "blog_comments" SET "parent_id" = NULL
WHERE "parent_id" IS NOT NULL
  AND "parent_id" NOT IN (SELECT "id" FROM "blog_comments");
--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parent_id_blog_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_comments"("id") ON DELETE cascade ON UPDATE no action;

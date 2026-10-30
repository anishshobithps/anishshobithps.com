ALTER TABLE "blog_comments" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "blog_comments_pinned_idx" ON "blog_comments" USING btree ("is_pinned");
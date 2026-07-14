ALTER TABLE "projects" ADD COLUMN "slug" varchar(128);--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_slug_unique" UNIQUE("slug");
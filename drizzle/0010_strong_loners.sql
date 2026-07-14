CREATE TABLE "link_slugs" (
	"id" serial PRIMARY KEY NOT NULL,
	"link_id" integer NOT NULL,
	"tag" varchar(64) DEFAULT '' NOT NULL,
	"slug" varchar(128) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "link_slugs_tag_slug_unique" UNIQUE("tag","slug")
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" serial PRIMARY KEY NOT NULL,
	"target" varchar(2048) NOT NULL,
	"title" varchar(256),
	"description" text,
	"og_enabled" boolean DEFAULT false NOT NULL,
	"og_image" varchar(2048),
	"permanent" boolean DEFAULT false NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_slug_unique";--> statement-breakpoint
ALTER TABLE "link_slugs" ADD CONSTRAINT "link_slugs_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "link_slugs_link_idx" ON "link_slugs" USING btree ("link_id");--> statement-breakpoint
CREATE INDEX "links_enabled_idx" ON "links" USING btree ("enabled");--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "slug";
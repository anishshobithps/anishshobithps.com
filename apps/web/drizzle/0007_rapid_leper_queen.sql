CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"highlights" text[] DEFAULT '{}'::text[] NOT NULL,
	"live" varchar(512),
	"github" varchar(512) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "projects_enabled_idx" ON "projects" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "projects_sort_order_idx" ON "projects" USING btree ("sort_order");
CREATE TABLE "blog_reactions" (
	"slug" varchar(256) NOT NULL,
	"ip_hash" varchar(64) NOT NULL,
	"mood" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_reactions_slug_ip_hash_pk" PRIMARY KEY("slug","ip_hash")
);
--> statement-breakpoint
CREATE TABLE "blog_reads" (
	"slug" varchar(256) NOT NULL,
	"ip_hash" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_reads_slug_ip_hash_pk" PRIMARY KEY("slug","ip_hash")
);
--> statement-breakpoint
CREATE INDEX "blog_reactions_slug_idx" ON "blog_reactions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_reads_slug_idx" ON "blog_reads" USING btree ("slug");
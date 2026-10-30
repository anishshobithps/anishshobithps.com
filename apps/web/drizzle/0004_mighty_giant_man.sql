CREATE TABLE "blog_comment_likes" (
	"comment_id" integer NOT NULL,
	"clerk_user_id" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_comment_likes_comment_id_clerk_user_id_pk" PRIMARY KEY("comment_id","clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "blog_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(256) NOT NULL,
	"parent_id" integer,
	"clerk_user_id" varchar(256) NOT NULL,
	"body" text NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_comment_likes" ADD CONSTRAINT "blog_comment_likes_comment_id_blog_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."blog_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_comment_likes_comment_idx" ON "blog_comment_likes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "blog_comments_slug_idx" ON "blog_comments" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_comments_parent_idx" ON "blog_comments" USING btree ("parent_id");
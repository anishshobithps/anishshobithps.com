CREATE TABLE "guestbook_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" varchar(256) NOT NULL,
	"message" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guestbook_likes" (
	"entry_id" integer NOT NULL,
	"clerk_user_id" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guestbook_likes_entry_id_clerk_user_id_pk" PRIMARY KEY("entry_id","clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "guestbook_likes" ADD CONSTRAINT "guestbook_likes_entry_id_guestbook_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."guestbook_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guestbook_entries_clerk_user_idx" ON "guestbook_entries" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "guestbook_entries_created_at_idx" ON "guestbook_entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "guestbook_likes_entry_idx" ON "guestbook_likes" USING btree ("entry_id");
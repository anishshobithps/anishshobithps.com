CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"page" varchar(256) NOT NULL,
	"thread" integer,
	"author" varchar(256) NOT NULL,
	"content" json NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rates" (
	"userId" varchar(256) NOT NULL,
	"commentId" integer NOT NULL,
	"like" boolean NOT NULL,
	CONSTRAINT "rates_userId_commentId_pk" PRIMARY KEY("userId","commentId")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"userId" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"canDelete" boolean NOT NULL
);
--> statement-breakpoint
CREATE INDEX "comment_idx" ON "rates" USING btree ("commentId");
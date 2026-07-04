CREATE TABLE "rate_limits" (
	"key" varchar(192) NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
CREATE INDEX "rate_limits_window_start_idx" ON "rate_limits" USING btree ("window_start");
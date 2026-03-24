CREATE TABLE "pipelines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"source_path" text NOT NULL,
	"action_type" text NOT NULL,
	"config" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pipelines_source_path_unique" UNIQUE("source_path")
);

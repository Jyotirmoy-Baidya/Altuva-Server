CREATE TABLE "spotlights" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"quote" text NOT NULL,
	"person_name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

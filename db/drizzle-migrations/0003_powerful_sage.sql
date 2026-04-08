CREATE TABLE "popular_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(100) NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"cta_text" varchar(100) DEFAULT 'Shop All Products' NOT NULL,
	"cta_url" varchar(500) DEFAULT '/products' NOT NULL,
	"product_1_slug" varchar(255),
	"product_2_slug" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

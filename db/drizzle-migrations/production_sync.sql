-- ============================================================
-- Altuva Production Sync Migration
-- Run this once in Neon SQL Editor to bring DB up to date
-- ============================================================

-- pg_trgm for fuzzy product search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Spotlights table
CREATE TABLE IF NOT EXISTS "spotlights" (
    "id" serial PRIMARY KEY NOT NULL,
    "image_url" varchar(500) NOT NULL,
    "quote" text NOT NULL,
    "person_name" varchar(255) NOT NULL,
    "bg_color" varchar(50) DEFAULT '#3B0E0E' NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Popular Sections (People's Choice) table
CREATE TABLE IF NOT EXISTS "popular_sections" (
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

-- Hero banners: add CTA redirect URL
ALTER TABLE "hero_banners" ADD COLUMN IF NOT EXISTS "cta_button_url" varchar(500) DEFAULT '/products';

-- Customer users table (if not exists)
CREATE TABLE IF NOT EXISTS "customer_users" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "phone" varchar(20),
    "password" varchar(255) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "customer_users_email_unique" UNIQUE("email")
);

-- Addresses table (if not exists)
CREATE TABLE IF NOT EXISTS "addresses" (
    "id" serial PRIMARY KEY NOT NULL,
    "customer_id" integer NOT NULL,
    "name" varchar(255) NOT NULL,
    "address_line_1" varchar(500) NOT NULL,
    "address_line_2" varchar(500),
    "landmark" varchar(255),
    "pin" varchar(20) NOT NULL,
    "city" varchar(100) NOT NULL,
    "state" varchar(100) NOT NULL,
    "country" varchar(100) DEFAULT 'India' NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Taxes table (if not exists)
CREATE TABLE IF NOT EXISTS "taxes" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(100) NOT NULL,
    "type" varchar(20) DEFAULT 'percentage' NOT NULL,
    "value" numeric(8, 4) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Delivery charges table (if not exists)
CREATE TABLE IF NOT EXISTS "delivery_charges" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(100) NOT NULL,
    "min_order_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
    "max_order_amount" numeric(10, 2),
    "charge" numeric(10, 2) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Discount codes table (if not exists)
CREATE TABLE IF NOT EXISTS "discount_codes" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(255) NOT NULL,
    "code" varchar(100) NOT NULL,
    "type" varchar(20) DEFAULT 'flat' NOT NULL,
    "value" numeric(10, 2) NOT NULL,
    "min_order_amount" numeric(10, 2) DEFAULT '0',
    "max_uses" integer,
    "used_count" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "expires_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);

-- Carts table (if not exists)
CREATE TABLE IF NOT EXISTS "carts" (
    "id" serial PRIMARY KEY NOT NULL,
    "customer_id" integer NOT NULL,
    "discount_code_id" integer,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "carts_customer_id_unique" UNIQUE("customer_id")
);

-- Cart items table (if not exists)
CREATE TABLE IF NOT EXISTS "cart_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "cart_id" integer NOT NULL,
    "product_id" integer NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Foreign keys (safe to re-run with IF NOT EXISTS via DO block)
DO $$ BEGIN
    ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customer_id_fk"
        FOREIGN KEY ("customer_id") REFERENCES "customer_users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_fk"
        FOREIGN KEY ("customer_id") REFERENCES "customer_users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "carts" ADD CONSTRAINT "carts_discount_code_id_fk"
        FOREIGN KEY ("discount_code_id") REFERENCES "discount_codes"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fk"
        FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fk"
        FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

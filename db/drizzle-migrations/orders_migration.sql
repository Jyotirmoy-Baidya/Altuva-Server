-- ============================================================
-- Orders + Order Items Migration
-- Run in Neon SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS "orders" (
    "id" serial PRIMARY KEY NOT NULL,
    "order_number" varchar(50) NOT NULL UNIQUE,
    "customer_id" integer NOT NULL REFERENCES "customer_users"("id") ON DELETE RESTRICT,
    "delivery_address" jsonb NOT NULL,
    "subtotal" numeric(10, 2) NOT NULL,
    "discount_amount" numeric(10, 2) NOT NULL DEFAULT '0',
    "discount_code" varchar(100),
    "tax_amount" numeric(10, 2) NOT NULL DEFAULT '0',
    "tax_breakdown" jsonb NOT NULL DEFAULT '[]',
    "delivery_charge" numeric(10, 2) NOT NULL DEFAULT '0',
    "grand_total" numeric(10, 2) NOT NULL,
    "status" varchar(50) NOT NULL DEFAULT 'payment_pending',
    "payment_method" varchar(30) NOT NULL DEFAULT 'online',
    "razorpay_order_id" varchar(100),
    "razorpay_payment_id" varchar(100),
    "razorpay_signature" varchar(500),
    "payment_status" varchar(30) NOT NULL DEFAULT 'pending',
    "notes" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "order_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "order_id" integer NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
    "product_id" integer REFERENCES "products"("id") ON DELETE SET NULL,
    "product_name" varchar(255) NOT NULL,
    "product_sku" varchar(100),
    "product_image" varchar(500),
    "quantity" integer NOT NULL,
    "unit_price" numeric(10, 2) NOT NULL,
    "unit_mrp" numeric(10, 2) NOT NULL,
    "line_total" numeric(10, 2) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "orders_customer_id_idx" ON "orders" ("customer_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" ("created_at");
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items" ("order_id");

import { pgTable, serial, varchar, boolean, timestamp, text, numeric, integer, jsonb } from 'drizzle-orm/pg-core';

// Admin Users Table
export const adminUsers = pgTable('admin_users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone_number: varchar('phone_number', { length: 20 }),
    password: varchar('password', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull().default('admin'),
    approved: boolean('approved').notNull().default(false),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Hero Banners Table
export const heroBanners = pgTable('hero_banners', {
    id: serial('id').primaryKey(),
    image_url: varchar('image_url', { length: 500 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    subtitle: varchar('subtitle', { length: 255 }),
    headtext: text('headtext'),
    text_color: varchar('text_color', { length: 50 }).default('#000000'),
    cta_button_color: varchar('cta_button_color', { length: 50 }).default('#000000'),
    cta_button_text_color: varchar('cta_button_text_color', { length: 50 }).default('#FFFFFF'),
    cta_button_text: varchar('cta_button_text', { length: 100 }),
    is_active: boolean('is_active').notNull().default(true),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Products Table
export const products = pgTable('products', {
    id: serial('id').primaryKey(),

    // Basic Info
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    brand: varchar('brand', { length: 255 }).notNull(),

    // Category
    category: varchar('category', { length: 100 }).notNull(),
    sub_category: varchar('sub_category', { length: 100 }),
    type: varchar('type', { length: 100 }).default('Edible'),

    // Pricing
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    discounted_price: numeric('discounted_price', { precision: 10, scale: 2 }),
    discount_percentage: numeric('discount_percentage', { precision: 5, scale: 2 }).default('0'),
    currency: varchar('currency', { length: 10 }).default('INR'),

    // Inventory
    stock: integer('stock').notNull().default(0),
    low_stock_threshold: integer('low_stock_threshold').default(5),
    is_in_stock: boolean('is_in_stock').default(true),
    sku: varchar('sku', { length: 100 }).unique(),

    // Images
    primary_image: varchar('primary_image', { length: 500 }).notNull(),
    secondary_image: varchar('secondary_image', { length: 500 }),
    images: jsonb('images').default([]),  // [{ url, altText }]

    // Description
    description: text('description').notNull(),
    detailed_description: text('detailed_description'),
    key_features: jsonb('key_features').default([]),  // string[]

    // Food-specific
    ingredients: jsonb('ingredients').default([]),  // string[]
    nutrition_info: jsonb('nutrition_info').default({}),  // { calories, fat, carbs, protein }
    shelf_life: varchar('shelf_life', { length: 100 }),
    storage_instructions: text('storage_instructions'),
    care_instructions: text('care_instructions'),

    // Origin & Manufacturer
    country_of_origin: varchar('country_of_origin', { length: 100 }),
    manufacturer: jsonb('manufacturer').default({}),  // { name, address }

    // Contact / Compliance
    contact_email: varchar('contact_email', { length: 255 }),
    contact_phone: varchar('contact_phone', { length: 20 }),

    // External Links
    amazon_link: varchar('amazon_link', { length: 500 }),

    // Tags & Filters
    tags: jsonb('tags').default([]),      // string[]
    flavors: jsonb('flavors').default([]), // string[]
    weight: varchar('weight', { length: 50 }),

    // Ratings
    ratings_average: numeric('ratings_average', { precision: 3, scale: 2 }).default('0'),
    ratings_count: integer('ratings_count').default(0),

    // Status
    is_active: boolean('is_active').default(true),
    is_featured: boolean('is_featured').default(false),

    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type HeroBanner = typeof heroBanners.$inferSelect;
export type NewHeroBanner = typeof heroBanners.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

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
    cta_button_url: varchar('cta_button_url', { length: 500 }).default('/products'),
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

// ─── Customer Users ───────────────────────────────────────────────────────────
export const customerUsers = pgTable('customer_users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }),
    password: varchar('password', { length: 255 }).notNull(),
    is_active: boolean('is_active').notNull().default(true),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Addresses ────────────────────────────────────────────────────────────────
export const addresses = pgTable('addresses', {
    id: serial('id').primaryKey(),
    customer_id: integer('customer_id').notNull().references(() => customerUsers.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    address_line_1: varchar('address_line_1', { length: 500 }).notNull(),
    address_line_2: varchar('address_line_2', { length: 500 }),
    landmark: varchar('landmark', { length: 255 }),
    pin: varchar('pin', { length: 20 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    state: varchar('state', { length: 100 }).notNull(),
    country: varchar('country', { length: 100 }).notNull().default('India'),
    is_default: boolean('is_default').notNull().default(false),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Taxes (admin managed) ────────────────────────────────────────────────────
export const taxes = pgTable('taxes', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),       // e.g. CGST, SGST, IGST
    type: varchar('type', { length: 20 }).notNull().default('percentage'), // 'percentage' | 'flat'
    value: numeric('value', { precision: 8, scale: 4 }).notNull(), // e.g. 9 for 9%
    is_active: boolean('is_active').notNull().default(true),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Delivery Charges (admin managed) ────────────────────────────────────────
export const deliveryCharges = pgTable('delivery_charges', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),        // e.g. "Standard Delivery"
    min_order_amount: numeric('min_order_amount', { precision: 10, scale: 2 }).notNull().default('0'),
    max_order_amount: numeric('max_order_amount', { precision: 10, scale: 2 }), // null = no upper limit
    charge: numeric('charge', { precision: 10, scale: 2 }).notNull(),
    is_active: boolean('is_active').notNull().default(true),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Discount Codes (admin managed) ──────────────────────────────────────────
export const discountCodes = pgTable('discount_codes', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 100 }).notNull().unique(),
    type: varchar('type', { length: 20 }).notNull().default('flat'), // 'flat' | 'percentage'
    value: numeric('value', { precision: 10, scale: 2 }).notNull(),
    min_order_amount: numeric('min_order_amount', { precision: 10, scale: 2 }).default('0'),
    max_uses: integer('max_uses'),          // null = unlimited
    used_count: integer('used_count').notNull().default(0),
    is_active: boolean('is_active').notNull().default(true),
    expires_at: timestamp('expires_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Carts ────────────────────────────────────────────────────────────────────
export const carts = pgTable('carts', {
    id: serial('id').primaryKey(),
    customer_id: integer('customer_id').notNull().unique().references(() => customerUsers.id, { onDelete: 'cascade' }),
    discount_code_id: integer('discount_code_id').references(() => discountCodes.id, { onDelete: 'set null' }),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Cart Items ───────────────────────────────────────────────────────────────
export const cartItems = pgTable('cart_items', {
    id: serial('id').primaryKey(),
    cart_id: integer('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
    product_id: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Spotlights ───────────────────────────────────────────────────────────────
export const spotlights = pgTable('spotlights', {
    id: serial('id').primaryKey(),
    image_url: varchar('image_url', { length: 500 }).notNull(),
    quote: text('quote').notNull(),
    person_name: varchar('person_name', { length: 255 }).notNull(),
    bg_color: varchar('bg_color', { length: 50 }).notNull().default('#3B0E0E'),
    is_active: boolean('is_active').notNull().default(true),
    sort_order: integer('sort_order').notNull().default(0),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Popular Sections (People's Choice) ──────────────────────────────────────
export const popularSections = pgTable('popular_sections', {
    id: serial('id').primaryKey(),
    category: varchar('category', { length: 100 }).notNull(),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    cta_text: varchar('cta_text', { length: 100 }).notNull().default('Shop All Products'),
    cta_url: varchar('cta_url', { length: 500 }).notNull().default('/products'),
    product_1_slug: varchar('product_1_slug', { length: 255 }),
    product_2_slug: varchar('product_2_slug', { length: 255 }),
    is_active: boolean('is_active').notNull().default(true),
    sort_order: integer('sort_order').notNull().default(0),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type HeroBanner = typeof heroBanners.$inferSelect;
export type NewHeroBanner = typeof heroBanners.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type CustomerUser = typeof customerUsers.$inferSelect;
export type NewCustomerUser = typeof customerUsers.$inferInsert;

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;

export type Spotlight = typeof spotlights.$inferSelect;
export type NewSpotlight = typeof spotlights.$inferInsert;

export type PopularSection = typeof popularSections.$inferSelect;
export type NewPopularSection = typeof popularSections.$inferInsert;

export type Tax = typeof taxes.$inferSelect;
export type NewTax = typeof taxes.$inferInsert;

export type DeliveryCharge = typeof deliveryCharges.$inferSelect;
export type NewDeliveryCharge = typeof deliveryCharges.$inferInsert;

export type DiscountCode = typeof discountCodes.$inferSelect;
export type NewDiscountCode = typeof discountCodes.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    order_number: varchar('order_number', { length: 50 }).notNull().unique(),
    customer_id: integer('customer_id').notNull().references(() => customerUsers.id, { onDelete: 'restrict' }),
    delivery_address: jsonb('delivery_address').notNull(),  // snapshot of address
    subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
    discount_amount: numeric('discount_amount', { precision: 10, scale: 2 }).notNull().default('0'),
    discount_code: varchar('discount_code', { length: 100 }),
    tax_amount: numeric('tax_amount', { precision: 10, scale: 2 }).notNull().default('0'),
    tax_breakdown: jsonb('tax_breakdown').notNull().default([]),
    delivery_charge: numeric('delivery_charge', { precision: 10, scale: 2 }).notNull().default('0'),
    grand_total: numeric('grand_total', { precision: 10, scale: 2 }).notNull(),
    // 'payment_pending' | 'placed' | 'confirmed' | 'packed' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'canceled' | 'refunded'
    status: varchar('status', { length: 50 }).notNull().default('payment_pending'),
    payment_method: varchar('payment_method', { length: 30 }).notNull().default('online'),
    razorpay_order_id: varchar('razorpay_order_id', { length: 100 }),
    razorpay_payment_id: varchar('razorpay_payment_id', { length: 100 }),
    razorpay_signature: varchar('razorpay_signature', { length: 500 }),
    payment_status: varchar('payment_status', { length: 30 }).notNull().default('pending'), // 'pending' | 'paid' | 'failed'
    notes: text('notes'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    order_id: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    product_id: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
    product_name: varchar('product_name', { length: 255 }).notNull(),
    product_sku: varchar('product_sku', { length: 100 }),
    product_image: varchar('product_image', { length: 500 }),
    quantity: integer('quantity').notNull(),
    unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    unit_mrp: numeric('unit_mrp', { precision: 10, scale: 2 }).notNull(),
    line_total: numeric('line_total', { precision: 10, scale: 2 }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

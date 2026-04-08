# API Routes Documentation

This file tracks all routes, middlewares, and their functionality in the Altuva backend.

## Table of Contents
- [Middlewares](#middlewares)
- [Routes](#routes)
  - [Health & Testing](#health--testing-routes)
  - [Admin Auth](#admin-authentication-routes)
  - [Admin CMS - Hero Banners](#admin-cms-routes-hero-banners)
  - [Admin Products](#admin-product-routes)
  - [Admin Taxes](#admin-tax-routes)
  - [Admin Delivery Charges](#admin-delivery-charge-routes)
  - [Public CMS](#public-cms-routes)
  - [Public Products](#public-product-routes)
  - [Customer Auth](#customer-auth-routes)
  - [Customer Cart](#customer-cart-routes)
  - [Customer Addresses](#customer-address-routes)

---

## Middlewares

### Global Middlewares
Applied to all routes in the application.

| Middleware | File | Purpose | Order |
|------------|------|---------|-------|
| `express.json()` | Built-in | Parse incoming JSON request bodies | 1 |
| `logger` | `middlewares/logger.ts` | Log all incoming requests with timestamp | 2 |

### Protected Route Middlewares
Applied to specific routes that require authentication.

| Middleware | File | Purpose | Checks |
|------------|------|---------|--------|
| `adminMiddleware` | `middlewares/authMiddleware.ts` | Verify JWT token and check if user is approved | 1. Valid Bearer token<br>2. `approved = true` |

### Error Handling Middleware

| Middleware | File | Purpose |
|------------|------|---------|
| `errorHandler` | `middlewares/errorHandler.ts` | Global error handler for uncaught errors |

---

## Routes

### Health & Testing Routes
**File:** `routes/healthRoutes.ts`
**Controller:** `controllers/healthController.ts`

| Method | Endpoint | Controller Function | Description | Request Body | Response |
|--------|----------|-------------------|-------------|--------------|----------|
| GET | `/` | `getRoot` | Check if server is running | None | Plain text: "Backend server is running 🚀" |
| GET | `/api/hello` | `getHello` | Simple API test endpoint | None | `{ message: "Hello from backend!" }` |
| GET | `/api/db-test` | `testDatabase` | Test PostgreSQL database connection | None | Success: `{ message: string, timestamp: Date }`<br>Error: `{ message: string, error: string }` |

---

### Admin Authentication Routes
**File:** `routes/adminRoutes.ts`
**Controller:** `controllers/adminController.ts`
**Service:** `services/adminService.ts`

#### Public Routes (No Authentication Required)

| Method | Endpoint | Controller Function | Description | Request Body | Response |
|--------|----------|-------------------|-------------|--------------|----------|
| POST | `/admin/register` | `register` | Register new admin user (requires approval) | `{ name, email, phone_number?, password, role? }` | Success: `{ success: true, message, data: { id, name, email, phone_number, role, approved, created_at, updated_at } }`<br>Error: `{ success: false, message, error? }` |
| POST | `/admin/login` | `login` | Login admin user and get JWT token | `{ email, password }` | Success: `{ success: true, message, data: { token, user } }`<br>Error: `{ success: false, message }` |

#### Protected Routes (Requires Bearer Token + approved = true)

| Method | Endpoint | Middleware | Controller Function | Description | Request Headers | Request Body | Response |
|--------|----------|------------|-------------------|-------------|----------------|--------------|----------|
| POST | `/admin/create-user` | `adminMiddleware` | `createUser` | Create new admin user (can set approved status) | `Authorization: Bearer <token>` | `{ name, email, phone_number?, password, role?, approved? }` | Success: `{ success: true, message, data: { user } }`<br>Error: `{ success: false, message }` |
| GET | `/admin/get-me-admin-user` | `adminMiddleware` | `getMe` | Get current authenticated admin user info | `Authorization: Bearer <token>` | None | Success: `{ success: true, data: { id, name, email, phone_number, role, approved, created_at, updated_at } }`<br>Error: `{ success: false, message }` |

---

### Admin CMS Routes (Hero Banners)
**File:** `routes/adminCmsRoutes.ts`
**Controller:** `controllers/cmsController.ts`
**Service:** `services/cmsService.ts`
**Middleware:** `adminMiddleware` applied to all routes

| Method | Endpoint | Controller Function | Description | Request Body |
|--------|----------|-------------------|-------------|--------------|
| GET | `/admin/cms/hero-banners` | `getAllBanners` | Get all hero banners | None |
| GET | `/admin/cms/hero-banners/:id` | `getBannerById` | Get single banner | None |
| POST | `/admin/cms/hero-banners` | `createBanner` | Create banner (multipart: `image` file) | FormData: `image, title, subtitle?, headtext?, text_color?, cta_button_color?, cta_button_text_color?, cta_button_text?, is_active?` |
| PUT | `/admin/cms/hero-banners/:id` | `updateBannerById` | Update banner | FormData (same as create, all optional) |
| DELETE | `/admin/cms/hero-banners/:id` | `deleteBannerById` | Delete banner + Cloudinary image | None |

---

### Admin Product Routes
**File:** `routes/adminProductRoutes.ts`
**Controller:** `controllers/productController.ts`
**Service:** `services/productService.ts`
**Middleware:** `adminMiddleware` applied to all routes

| Method | Endpoint | Controller Function | Description | Request Body |
|--------|----------|-------------------|-------------|--------------|
| GET | `/admin/products` | `getAllProductsAdmin` | Get all products | None |
| GET | `/admin/products/:id` | `getProductById` | Get single product by ID | None |
| POST | `/admin/products` | `createProduct` | Create product (multipart: `primary_image` file) | FormData: `name, slug, brand, category, price, stock, description, primary_image` + all optional fields |
| PUT | `/admin/products/:id` | `updateProduct` | Update product | FormData (any fields, all optional) |
| DELETE | `/admin/products/:id` | `deleteProduct` | Delete product | None |

**JSON fields** (send as JSON strings in FormData): `images, key_features, ingredients, nutrition_info, manufacturer, tags, flavors`

---

### Public CMS Routes
**File:** `routes/publicCmsRoutes.ts`
**Controller:** `controllers/cmsController.ts`
**Middleware:** None (public)

| Method | Endpoint | Controller Function | Description |
|--------|----------|-------------------|-------------|
| GET | `/api/cms/hero-banners` | `getActiveBanners` | Get all active hero banners |

---

### Public Product Routes
**File:** `routes/publicProductRoutes.ts`
**Controller:** `controllers/productController.ts`
**Middleware:** None (public) — only returns `is_active = true` products

| Method | Endpoint | Controller Function | Description |
|--------|----------|-------------------|-------------|
| GET | `/public/products` | `getPublicProducts` | Get active products with filters |
| GET | `/public/products/:slug` | `getPublicProductBySlug` | Get product by slug |

**Query Filters for** `GET /public/products`:

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `category` | string | `?category=Jam` | Filter by category |
| `sub_category` | string | `?sub_category=Fruit Jam` | Filter by sub-category |
| `brand` | string | `?brand=Altuva` | Filter by brand |
| `is_featured` | boolean | `?is_featured=true` | Featured products only |
| `search` | string | `?search=mango` | Search by product name |
| `min_price` | number | `?min_price=100` | Min price filter |
| `max_price` | number | `?max_price=500` | Max price filter |
| `tags` | string (comma-sep) | `?tags=organic,fresh` | Filter by tags |
| `flavors` | string (comma-sep) | `?flavors=mango,berry` | Filter by flavors |
| `limit` | number | `?limit=20` | Results per page (default: 20) |
| `offset` | number | `?offset=0` | Pagination offset (default: 0) |

---

## Database Schema

### admin_users Table
**File:** `db/schema.sql`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing user ID |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email (used for login) |
| phone_number | VARCHAR(20) | NULL | User's phone number |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | VARCHAR(50) | DEFAULT 'admin' | User role (admin, super_admin, etc.) |
| approved | BOOLEAN | DEFAULT false | Account approval status |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_admin_users_email` - Fast email lookups
- `idx_admin_users_approved` - Filter by approval status

---

## Authentication Flow

### 1. Registration Flow
1. User submits registration with email, password, name, phone_number
2. System hashes password using bcrypt
3. User created with `approved = false`
4. User receives message: "Please wait for admin approval"

### 2. Login Flow
1. User submits email and password
2. System validates credentials
3. System checks if `approved = true`
4. If approved, generate JWT token containing: `{ id, email, role, approved }`
5. Return token and user data

### 3. Protected Route Access
1. Client sends request with `Authorization: Bearer <token>` header
2. `adminMiddleware` validates JWT token
3. Middleware checks if `approved = true`
4. If valid and approved, attach user data to `req.user`
5. Controller processes request

---

## Notes

- All routes use **named exports** (no default exports)
- No `index.ts` files for re-exporting
- Database queries should be handled in **services** layer
- Controllers should only handle request/response logic
- All routes must be documented here when added

---

## Environment Variables Required

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Altuva

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

---

---

### Customer Auth Routes
**File:** `routes/customerRoutes.ts`
**Controller:** `controllers/customerController.ts`
**Service:** `services/customerService.ts`

| Method | Endpoint | Auth | Description | Body |
|--------|----------|------|-------------|------|
| POST | `/customer/register` | None | Register new customer | `{ name, email, password, phone? }` |
| POST | `/customer/login` | None | Login, returns JWT | `{ email, password }` |
| GET | `/customer/get-me` | Bearer | Get current customer profile | — |
| PUT | `/customer/update-profile` | Bearer | Update name/phone | `{ name?, phone? }` |

---

### Customer Cart Routes
**File:** `routes/customerRoutes.ts`
**Controller:** `controllers/cartController.ts`
**Service:** `services/cartService.ts`
**Middleware:** `customerMiddleware` on all cart routes

Cart response shape:
```json
{
  "items": [{ "product_id", "product", "quantity", "unit_price", "line_total" }],
  "total_before_discount": 500.00,
  "discount": { "name", "code", "type", "value", "amount" } | null,
  "total_after_discount": 450.00,
  "tax_breakdown": [{ "id", "name", "type", "value", "amount" }],
  "total_tax": 40.50,
  "delivery_charge": { "name", "slab", "amount" },
  "grand_total": 540.50,
  "item_count": 3
}
```

> **Recalculation** — every add / update / remove / clear / apply-discount operation returns the full recalculated cart.  
> **Tax** — applied on `total_before_discount` (item selling prices × qty), not on post-discount total.  
> **Delivery** — applied on `total_after_discount` using matching slab from `delivery_charges` table.

| Method | Endpoint | Auth | Description | Body / Params |
|--------|----------|------|-------------|---------------|
| GET | `/customer/cart` | Bearer | Get cart with full breakdown | — |
| POST | `/customer/cart/add/:productId` | Bearer | Add product to cart | `{ quantity? }` (default 1) |
| PUT | `/customer/cart/update/:productId` | Bearer | Set quantity (0 = remove) | `{ quantity }` |
| DELETE | `/customer/cart/remove/:productId` | Bearer | Remove product from cart | — |
| DELETE | `/customer/cart/clear` | Bearer | Empty cart & remove discount | — |
| POST | `/customer/cart/apply-discount` | Bearer | Apply discount code | `{ code }` |
| DELETE | `/customer/cart/remove-discount` | Bearer | Remove applied discount | — |

---

### Customer Address Routes
**File:** `routes/customerRoutes.ts`
**Controller:** `controllers/addressController.ts`
**Service:** `services/addressService.ts`
**Middleware:** `customerMiddleware` on all address routes

| Method | Endpoint | Auth | Description | Body |
|--------|----------|------|-------------|------|
| GET | `/customer/addresses` | Bearer | List all addresses | — |
| POST | `/customer/addresses` | Bearer | Add new address | `{ name, address_line_1, address_line_2?, landmark?, pin, city, state, country?, is_default? }` |
| PUT | `/customer/addresses/:id` | Bearer | Update address | Any address fields |
| DELETE | `/customer/addresses/:id` | Bearer | Delete address | — |
| PATCH | `/customer/addresses/:id/set-default` | Bearer | Mark as default | — |

---

### Admin Tax Routes
**File:** `routes/adminTaxRoutes.ts`
**Controller:** `controllers/taxController.ts`
**Service:** `services/taxService.ts`
**Middleware:** `adminMiddleware` on all routes

Tax types: `percentage` | `flat`  
Active taxes are automatically applied to every cart calculation.

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/admin/taxes` | List all taxes | — |
| POST | `/admin/taxes` | Create tax | `{ name, type, value, is_active? }` |
| PUT | `/admin/taxes/:id` | Update tax | Any tax fields |
| DELETE | `/admin/taxes/:id` | Delete tax | — |

Example taxes:
```json
{ "name": "CGST", "type": "percentage", "value": 9 }
{ "name": "SGST", "type": "percentage", "value": 9 }
```

---

### Admin Delivery Charge Routes
**File:** `routes/adminDeliveryRoutes.ts`
**Controller:** `controllers/deliveryChargeController.ts`
**Service:** `services/deliveryChargeService.ts`
**Middleware:** `adminMiddleware` on all routes

Slabs are matched by order total after discount. `max_order_amount = null` means no upper limit.

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/admin/delivery-charges` | List all slabs | — |
| POST | `/admin/delivery-charges` | Create slab | `{ name, min_order_amount, max_order_amount?, charge, is_active? }` |
| PUT | `/admin/delivery-charges/:id` | Update slab | Any slab fields |
| DELETE | `/admin/delivery-charges/:id` | Delete slab | — |

Example slabs:
```json
{ "name": "Standard", "min_order_amount": 0,   "max_order_amount": 100,  "charge": 50 }
{ "name": "Reduced",  "min_order_amount": 100,  "max_order_amount": null, "charge": 10 }
```

---

## Database Schema (additions)

### customer_users
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | — |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| phone | VARCHAR(20) | optional |
| password | VARCHAR(255) | bcrypt hashed |
| is_active | BOOLEAN | default true |
| created_at / updated_at | TIMESTAMP | — |

### addresses
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | — |
| customer_id | INT FK → customer_users | CASCADE delete |
| name | VARCHAR(255) | recipient name |
| address_line_1 | VARCHAR(500) | NOT NULL |
| address_line_2 | VARCHAR(500) | optional |
| landmark | VARCHAR(255) | optional |
| pin | VARCHAR(20) | NOT NULL |
| city / state / country | VARCHAR | country defaults to "India" |
| is_default | BOOLEAN | default false |

### taxes
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | — |
| name | VARCHAR(100) | e.g. CGST, SGST |
| type | VARCHAR(20) | `percentage` or `flat` |
| value | NUMERIC(8,4) | e.g. 9 for 9% |
| is_active | BOOLEAN | if false, excluded from cart |

### delivery_charges
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | — |
| name | VARCHAR(100) | slab label |
| min_order_amount | NUMERIC | inclusive lower bound |
| max_order_amount | NUMERIC | NULL = no upper limit |
| charge | NUMERIC | delivery fee in ₹ |
| is_active | BOOLEAN | — |

### discount_codes
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | — |
| name | VARCHAR(255) | display name |
| code | VARCHAR(100) | UNIQUE, uppercase |
| type | VARCHAR(20) | `flat` or `percentage` |
| value | NUMERIC | discount amount / % |
| min_order_amount | NUMERIC | minimum cart total required |
| max_uses | INT | NULL = unlimited |
| used_count | INT | tracked on use |
| expires_at | TIMESTAMP | NULL = no expiry |
| is_active | BOOLEAN | — |

### carts
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | — |
| customer_id | INT FK → customer_users | UNIQUE (1 cart per customer) |
| discount_code_id | INT FK → discount_codes | nullable |

### cart_items
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | — |
| cart_id | INT FK → carts | CASCADE delete |
| product_id | INT FK → products | CASCADE delete |
| quantity | INT | min 1 |

---

**Last Updated:** 2026-04-06

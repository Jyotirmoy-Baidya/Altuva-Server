# API Routes Documentation

This file tracks all routes, middlewares, and their functionality in the Altuva backend.

## Table of Contents
- [Middlewares](#middlewares)
- [Routes](#routes)
  - [Health & Testing](#health--testing-routes)
  - [Admin Auth](#admin-authentication-routes)
  - [Admin CMS - Hero Banners](#admin-cms-routes-hero-banners)
  - [Admin Products](#admin-product-routes)
  - [Public CMS](#public-cms-routes)
  - [Public Products](#public-product-routes)

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

**Last Updated:** 2026-04-04

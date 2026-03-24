# Quick Start Guide

Get the Altuva backend up and running in 5 minutes.

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
cd altuva-server
npm install
```

### 2. Create Database

```bash
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE "Altuva";

# Exit
\q
```

### 3. Configure Environment

The `.env` file is already set up:

```env
DB_USER=postgres
DB_PASSWORD=Jyoti123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Altuva
DATABASE_URL=postgresql://postgres:Jyoti123@localhost:5432/Altuva

PORT=3000
NODE_ENV=development

JWT_SECRET=altuva-super-secret-key-change-in-production-2026
JWT_EXPIRES_IN=7d
```

### 4. Run Database Migrations

```bash
npm run migrate:up
```

This creates all tables (admin_users, etc.)

### 5. Start Server

```bash
npm run dev
```

Server runs at: **http://localhost:3000**

## ✅ Verify Setup

### Test Health Endpoint

```bash
curl http://localhost:3000/
# Should return: "Backend server is running 🚀"
```

### Test Database Connection

```bash
curl http://localhost:3000/api/db-test
# Should return: { "message": "Database connected successfully!", "timestamp": "..." }
```

## 👤 Create First Admin User

### Option 1: Register via API

```bash
curl -X POST http://localhost:3000/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@altuva.com",
    "password": "admin123",
    "phone_number": "1234567890"
  }'
```

### Option 2: Manually Approve User

```bash
# Connect to database
psql -U postgres -d Altuva

# Approve the user
UPDATE admin_users SET approved = true WHERE email = 'admin@altuva.com';

# Exit
\q
```

### Login and Get Token

```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@altuva.com",
    "password": "admin123"
  }'
```

Copy the `token` from the response.

### Test Protected Route

```bash
curl http://localhost:3000/admin/get-me-admin-user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📁 Project Structure

```
altuva-server/
├── db/
│   ├── migrations/              # Database migrations
│   ├── config.ts               # Database connection
│   └── schema.sql              # Schema reference (not used for migrations)
├── controllers/                # Request handlers
├── routes/                     # Route definitions
├── services/                   # Business logic
├── middlewares/               # Auth, error handling, logging
├── utils/                     # JWT helpers
├── server.ts                  # Main entry point
├── .env                       # Environment variables
└── package.json              # Dependencies
```

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start with hot reload

# Build
npm run build           # Compile TypeScript
npm start               # Run production build

# Database Migrations
npm run migrate:up      # Run pending migrations
npm run migrate:down    # Rollback last migration
# Check migration status in database:
# psql -U postgres -d Altuva -c "SELECT * FROM pgmigrations;"
npm run migrate:create  # Create new migration
npm run db:reset        # Reset database (⚠️ destructive)
```

## 📚 Documentation

- **API Routes:** [`ROUTES.md`](ROUTES.md)
- **Migrations:** [`MIGRATIONS.md`](MIGRATIONS.md)
- **Full README:** [`README.md`](README.md)

## 🎯 Next Steps

1. ✅ **Backend running** on http://localhost:3000
2. ✅ **Database set up** with migrations
3. ✅ **Admin user created** and approved

Now you can:
- Start the admin dashboard (`cd ../altuva-admin-dashboard && npm run dev`)
- Create more migrations as needed
- Build new features
- Test the API endpoints

---

**Having issues?** Check:
1. PostgreSQL is running
2. Database "Altuva" exists
3. `.env` credentials are correct
4. Migrations have been run (`npm run migrate:status`)

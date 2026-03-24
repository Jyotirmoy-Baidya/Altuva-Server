# Altuva Backend Server

Express + TypeScript + PostgreSQL backend server with JWT authentication.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database

Make sure PostgreSQL is running, then create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE "Altuva";

# Exit
\q
```

### 3. Run Database Schema

```bash
# Connect to the Altuva database
psql -U postgres -d Altuva

# Run the schema file
\i db/schema.sql

# Verify table was created
\dt

# Exit
\q
```

### 4. Configure Environment

The [`.env`](.env) file is already configured with:
```env
DB_USER=postgres
DB_PASSWORD=Jyoti123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Altuva
PORT=3000
NODE_ENV=development
JWT_SECRET=altuva-super-secret-key-change-in-production-2026
JWT_EXPIRES_IN=7d
```

### 5. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production build
npm run build
npm start
```

## 📁 Project Structure

```
altuva-server/
├── controllers/          # Request handlers
├── routes/              # Route definitions
├── services/            # Business logic & database operations
├── middlewares/         # Custom middlewares
├── db/                  # Database configuration & schema
├── utils/               # Helper functions (JWT, etc.)
├── server.ts            # Main application entry
├── ROUTES.md           # Complete API documentation
└── .env                # Environment variables
```

## 🔐 Admin Authentication API

### Public Routes

#### Register Admin User
```bash
POST /admin/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone_number": "1234567890",
  "password": "securepassword123",
  "role": "admin"
}
```

**Response:** User created with `approved = false` (requires admin approval)

#### Login
```bash
POST /admin/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone_number": "1234567890",
      "role": "admin",
      "approved": true
    }
  }
}
```

### Protected Routes (Require Bearer Token)

#### Create User
```bash
POST /admin/create-user
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone_number": "9876543210",
  "password": "securepass456",
  "role": "admin",
  "approved": true
}
```

#### Get Current User
```bash
GET /admin/get-me-admin-user
Authorization: Bearer <your-token>
```

## 🧪 Testing the API

### 1. Test Server Health
```bash
curl http://localhost:3000/
```

### 2. Test Database Connection
```bash
curl http://localhost:3000/api/db-test
```

### 3. Register First Admin (Manual Approval Needed)
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

### 4. Manually Approve User in Database
```bash
psql -U postgres -d Altuva
UPDATE admin_users SET approved = true WHERE email = 'admin@altuva.com';
\q
```

### 5. Login and Get Token
```bash
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@altuva.com",
    "password": "admin123"
  }'
```

### 6. Use Token to Access Protected Routes
```bash
# Replace <TOKEN> with the actual token from login response
curl http://localhost:3000/admin/get-me-admin-user \
  -H "Authorization: Bearer <TOKEN>"
```

## 📖 Documentation

- **API Routes:** See [`ROUTES.md`](ROUTES.md) for complete API documentation
- **Database Schema:** See [`db/schema.sql`](db/schema.sql)

## 🔧 Technologies

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📝 Notes

- All passwords are hashed using bcrypt
- JWT tokens expire in 7 days
- New users require `approved = true` to access protected routes
- See [`ROUTES.md`](ROUTES.md) for detailed API documentation

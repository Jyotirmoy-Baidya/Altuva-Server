# Database Migrations Guide

This guide explains how to manage database schema changes using migrations in the Altuva backend.

## 🎯 What are Migrations?

Migrations are version-controlled files that track changes to your database schema over time. Instead of manually running SQL commands, migrations:

- **Track changes** - Every schema change is recorded
- **Version control** - Migrations are committed with your code
- **Rollback support** - Easily undo changes
- **Team collaboration** - Everyone gets the same schema
- **Automatic execution** - No manual SQL needed

## 🛠️ Migration Tool

We use **`node-pg-migrate`** for database migrations.

### Configuration

- **Migration folder:** `db/migrations/`
- **Config file:** `.pgmigraterc`
- **Database URL:** From `DATABASE_URL` in `.env`

## 📝 Migration Commands

### 1. Run Pending Migrations (Apply Changes)

Apply all pending migrations to the database:

```bash
npm run migrate:up
```

This will:
- Create new tables
- Add new columns
- Create indexes
- Apply any schema changes

### 2. Rollback Last Migration

Undo the last migration:

```bash
npm run migrate:down
```

### 3. Create New Migration

Create a new migration file:

```bash
npm run migrate:create add-users-table
npm run migrate:create add-email-column-to-users
npm run migrate:create create-products-table
```

This creates a file like: `db/migrations/1774379244864_add-users-table.js`

### 4. Check Migration Status

Check which migrations have been applied:

```bash
# Connect to database
psql -U postgres -d Altuva

# View migrations table
SELECT * FROM pgmigrations;

# Exit
\q
```

### 5. Reset Database (⚠️ Destructive)

Drop all tables and re-run all migrations:

```bash
npm run db:reset
```

**Warning:** This will delete all data!

## 🚀 Quick Start - First Time Setup

### Step 1: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE "Altuva";

# Exit
\q
```

### Step 2: Run Migrations

```bash
cd altuva-server
npm run migrate:up
```

This will create the `admin_users` table with all columns and indexes.

### Step 3: Verify

```bash
# Check what was created
psql -U postgres -d Altuva

# List tables
\dt

# Describe admin_users table
\d admin_users

# Exit
\q
```

## 📂 Existing Migrations

### Migration: `1774379244864_create-admin-users-table.js`

**Purpose:** Create admin_users table

**Schema:**
```sql
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_approved ON admin_users(approved);
```

## ✍️ Creating a New Migration

### Example: Add a new column

```bash
# Create migration
npm run migrate:create add-profile-picture-to-admin-users
```

**Edit the migration file:**

```javascript
exports.up = (pgm) => {
    pgm.addColumn('admin_users', {
        profile_picture: {
            type: 'varchar(500)',
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumn('admin_users', 'profile_picture');
};
```

**Run the migration:**

```bash
npm run migrate:up
```

### Example: Create a new table

```bash
# Create migration
npm run migrate:create create-products-table
```

**Edit the migration file:**

```javascript
exports.up = (pgm) => {
    pgm.createTable('products', {
        id: 'id',
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
        description: {
            type: 'text',
            notNull: false,
        },
        price: {
            type: 'decimal(10,2)',
            notNull: true,
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    pgm.createIndex('products', 'name');
};

exports.down = (pgm) => {
    pgm.dropTable('products');
};
```

**Run the migration:**

```bash
npm run migrate:up
```

## 🔄 Migration Workflow

### Development Workflow

1. **Make schema change** → Create migration
2. **Test locally** → Run `npm run migrate:up`
3. **Commit migration** → Add to git
4. **Push code** → Share with team
5. **Team pulls** → Runs `npm run migrate:up`

### Production Workflow

1. **Deploy code** to production
2. **Run migrations** before starting server:
   ```bash
   npm run migrate:up
   npm start
   ```

## 📋 Best Practices

### DO ✅

- **Always create migrations** for schema changes
- **Test migrations** locally before committing
- **Write descriptive names** for migrations
- **Include `down` migrations** for rollback
- **Run migrations** before starting the server
- **Commit migrations** with your code

### DON'T ❌

- **Don't modify existing migrations** after they're deployed
- **Don't run SQL manually** in production
- **Don't delete migrations** that have been run
- **Don't skip migrations** in production
- **Don't use `db:reset`** in production

## 🗂️ Migration File Structure

```javascript
// db/migrations/1774379244864_create-admin-users-table.js

exports.up = (pgm) => {
    // Changes to apply (create table, add column, etc.)
    pgm.createTable('admin_users', {
        id: 'id',
        name: { type: 'varchar(255)', notNull: true },
        // ... more columns
    });
};

exports.down = (pgm) => {
    // How to undo the changes
    pgm.dropTable('admin_users');
};
```

## 🔍 Common Operations

### Add Column
```javascript
pgm.addColumn('table_name', {
    column_name: { type: 'varchar(255)', notNull: false },
});
```

### Remove Column
```javascript
pgm.dropColumn('table_name', 'column_name');
```

### Add Index
```javascript
pgm.createIndex('table_name', 'column_name', {
    name: 'idx_table_column',
});
```

### Alter Column
```javascript
pgm.alterColumn('table_name', 'column_name', {
    type: 'text',
});
```

### Rename Table
```javascript
pgm.renameTable('old_name', 'new_name');
```

## 📊 Migration State

Migrations are tracked in the `pgmigrations` table:

```sql
SELECT * FROM pgmigrations;
```

Shows which migrations have been run and when.

## 🆘 Troubleshooting

### Migration fails
```bash
# Rollback last migration
npm run migrate:down

# Fix the migration file
# Run again
npm run migrate:up
```

### Database out of sync
```bash
# Reset (⚠️ deletes data)
npm run db:reset
```

### Manual migration needed
```bash
# Connect to database
psql -U postgres -d Altuva

# Run SQL manually (not recommended for production)
-- your SQL here

# Exit
\q
```

## 📚 Resources

- [node-pg-migrate Documentation](https://salsita.github.io/node-pg-migrate/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Summary

**To push schema to database:**

```bash
# 1. Create migration (if needed)
npm run migrate:create your-migration-name

# 2. Edit the migration file in db/migrations/

# 3. Run migration
npm run migrate:up

# Done! Schema is now in the database
```

**Changes are NOT automatic** - you must create and run migrations.

This ensures:
- ✅ Version control
- ✅ Team collaboration
- ✅ Rollback capability
- ✅ Production safety

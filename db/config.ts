import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

// PostgreSQL connection pool configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Test the database connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

// Test connection on startup
pool.query('SELECT NOW()')
    .then(() => {
        console.log('✅ Database connection successful!');
    })
    .catch((err: Error) => {
        console.error('❌ Failed to connect to database:', err.message);
        console.error('Make sure PostgreSQL is running and database "Altuva" exists');
    });

// Create Drizzle instance
export const db = drizzle(pool, { schema });

export { pool };

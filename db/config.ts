import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool configuration
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
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

// Query helper function
const query = (text: string, params?: any[]): Promise<QueryResult> => {
    return pool.query(text, params);
};

export { pool, query };

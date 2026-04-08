import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, ssl: {
        rejectUnauthorized: false, // 🔥 REQUIRED for Neon
    },
});

async function run() {
    const client = await pool.connect();
    try {
        // 1. Enable pg_trgm
        await client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
        console.log('✅ pg_trgm extension enabled');

        // 2. Ensure drizzle migrations journal table exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
                id serial PRIMARY KEY,
                hash text NOT NULL,
                created_at bigint
            );
        `);

        // 3. Read all migration SQL files in order
        const migrationsDir = path.join(__dirname, '../db/drizzle-migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        for (const file of files) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            const hash = crypto.createHash('sha256').update(sql).digest('hex');

            const existing = await client.query(
                'SELECT id FROM "__drizzle_migrations" WHERE hash = $1',
                [hash]
            );

            if (existing.rows.length > 0) {
                console.log(`ℹ️  ${file} already applied, skipping`);
                continue;
            }

            // Split on drizzle's statement-breakpoint marker and run each statement
            const statements = sql
                .split('--> statement-breakpoint')
                .map(s => s.trim())
                .filter(Boolean);

            for (const stmt of statements) {
                await client.query(stmt);
            }

            await client.query(
                'INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)',
                [hash, Date.now()]
            );
            console.log(`✅ Applied ${file}`);
        }

        console.log('✅ All migrations applied — DB is up to date');
    } finally {
        client.release();
        await pool.end();
    }
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });

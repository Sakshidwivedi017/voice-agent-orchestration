import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDb(): Pool {
    if (!pool) {
        // Ensure DATABASE_URL exists
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error('DATABASE_URL is not defined in environment variables.');
        }

        pool = new Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            },
            max: 10,
            allowExitOnIdle: true
        });
    }

    return pool;
}

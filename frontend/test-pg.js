require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const res = await pool.query('SELECT 1');
        console.log('✅ DB Connected. Answer:', res.rows[0]);
        const agents = await pool.query('SELECT count(*) FROM agents');
        console.log(`✅ DB Agents Count: ${agents.rows[0].count}`);
    } catch (err) {
        console.error('❌ DB Connection failed:', err);
    } finally {
        pool.end();
    }
}

run();

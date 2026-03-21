const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function test() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1
  });
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected to DB:', res.rows[0]);
  } catch (err) {
    console.error('DB Connection Error:', err);
  } finally {
    await pool.end();
  }
}
test();

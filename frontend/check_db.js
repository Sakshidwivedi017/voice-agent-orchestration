const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres:h%26qh5nW%3C@34.131.199.156:5432/agent_platform",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const constr = await pool.query(`
      SELECT t.relname as table, conname, contype, 
             pg_get_constraintdef(c.oid) as def
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname IN ('phone_numbers', 'agents', 'users');
    `);
    console.log('Constraints:', JSON.stringify(constr.rows, null, 2));

    const idx = await pool.query(`
      SELECT tablename, indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename IN ('phone_numbers', 'agents', 'users');
    `);
    console.log('Indexes:', JSON.stringify(idx.rows, null, 2));

    const orphans_pn = await pool.query(`
      SELECT id, user_id FROM phone_numbers WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);
    `);
    console.log('Orphan phone numbers:', JSON.stringify(orphans_pn.rows, null, 2));

    const orphans_agents = await pool.query(`
      SELECT agent_id, phone_number_id FROM agents WHERE phone_number_id IS NOT NULL AND phone_number_id NOT IN (SELECT id FROM phone_numbers);
    `);
    console.log('Orphan agents mapped to phone numbers:', JSON.stringify(orphans_agents.rows, null, 2));

    // Also check orphans based on user_id if applicable
    const orphans_agents_user = await pool.query(`
      SELECT agent_id, user_id FROM agents WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);
    `);
    console.log('Orphan agents mapped to users:', JSON.stringify(orphans_agents_user.rows, null, 2));

  } finally {
    await pool.end();
  }
}
run().catch(console.error);

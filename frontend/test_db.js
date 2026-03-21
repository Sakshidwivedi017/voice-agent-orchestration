const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:h&qh5nW<@34.131.199.156:5432/agent_platform?sslmode=no-verify'
});

async function main() {
    await client.connect();
    const res = await client.query('SELECT * FROM agents LIMIT 5;');
    console.log('agents', res.rows);
    const users = await client.query('SELECT * FROM users LIMIT 5;');
    console.log('users', users.rows);
    const kbRes = await client.query('SELECT * FROM knowledge_files LIMIT 5;');
    console.log('files', kbRes.rows);
    await client.end();
}

main().catch(console.error);

import asyncio
import asyncpg
import os
import certifi
import json
from dotenv import load_dotenv

os.environ["SSL_CERT_FILE"] = certifi.where()
load_dotenv()

async def main():
    db_url = os.getenv("DATABASE_URL")
    conn = await asyncpg.connect(db_url)
    
    # Check constraints
    constr = await conn.fetch("""
        SELECT t.relname as table_name, conname, contype, 
               pg_get_constraintdef(c.oid) as def
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname IN ('phone_numbers', 'agents', 'users');
    """)
    
    print("--- CONSTRAINTS ---")
    for r in constr:
        print(f"[{r['table_name']}] {r['conname']} ({r['contype']}): {r['def']}")

    # Check indexes
    idx = await conn.fetch("""
        SELECT tablename, indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename IN ('phone_numbers', 'agents', 'users');
    """)
    print("\n--- INDEXES ---")
    for r in idx:
        print(f"[{r['tablename']}] {r['indexname']}: {r['indexdef']}")

    print("\n--- ORPHANS ---")
    # Check orphans: phone_numbers without a valid user
    try:
        orphans_pn = await conn.fetch("SELECT id, user_id FROM phone_numbers WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);")
        print("Orphan phone_numbers:", [dict(r) for r in orphans_pn])
    except Exception as e:
        print("Orphan check PN failed:", e)

    # Check orphans: agents without a phone_number
    try:
        orphans_agents = await conn.fetch("SELECT agent_id, phone_number_id FROM agents WHERE phone_number_id IS NOT NULL AND phone_number_id NOT IN (SELECT id FROM phone_numbers);")
        print("Orphan agents to PN:", [dict(r) for r in orphans_agents])
    except Exception as e:
        print("Orphan check Agents to PN failed:", e)

    # Check orphans: agents without a user_id
    try:
        orphans_agents_user = await conn.fetch("SELECT agent_id, user_id FROM agents WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);")
        print("Orphan agents to user:", [dict(r) for r in orphans_agents_user])
    except Exception as e:
        print("Orphan check Agents to user failed:", e)

    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())

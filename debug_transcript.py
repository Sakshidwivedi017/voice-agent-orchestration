import asyncio
import asyncpg
import os
import json
from dotenv import load_dotenv

async def run():
    load_dotenv()
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        with open('config_fixed.json', 'r') as f:
            config = json.load(f)
            db_url = config.get('DATABASE_URL')
            
    conn = await asyncpg.connect(db_url, ssl='require')
    row = await conn.fetchrow('SELECT transcript FROM call_logs WHERE caller_number = $1 ORDER BY created_at DESC LIMIT 1', '+919315980744')
    if row:
        print("TRANSCRIPT FOUND:")
        print(row['transcript'])
    else:
        print("No log found for +919315980744")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(run())

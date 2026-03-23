import asyncio
import asyncpg
import os
import json
from dotenv import load_dotenv

load_dotenv()

async def check():
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        try:
            with open('config_fixed.json', 'r') as f:
                config = json.load(f)
                db_url = config.get('DATABASE_URL')
        except: pass
        
    if not db_url:
        print("DATABASE_URL not found")
        return

    try:
        conn = await asyncpg.connect(db_url, ssl='require')
        rows = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reservations'")
        print("RESERVATIONS COLUMNS:")
        for r in rows:
            print(f"- {r['column_name']} ({r['data_type']})")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(check())

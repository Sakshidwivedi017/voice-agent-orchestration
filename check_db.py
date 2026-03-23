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
    
    conn = await asyncpg.connect(db_url, ssl='require')
    
    # Check tables
    tables = await conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    table_list = [t['table_name'] for t in tables]
    print(f"Tables: {table_list}")
    
    # Check influencer schema if it exists
    if 'influencer' in table_list:
        cols = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'influencer'")
        print(f"Influencer Columns: {[dict(c) for c in cols]}")
    
    await conn.close()

if __name__ == "__main__":
    asyncio.run(check())

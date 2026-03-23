import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv('/Users/sakshi/Downloads/voice-agent/.env')

async def run():
    try:
        db_url = os.getenv('DATABASE_URL')
        if not db_url:
            print("DATABASE_URL not set in .env")
            return
            
        print(f"Connecting to {db_url.split('@')[-1]}...")
        conn = await asyncpg.connect(db_url, ssl='require')
        
        with open('add_missing_columns.sql', 'r') as f:
            sql = f.read()
            
        print("Executing migration...")
        await conn.execute(sql)
        print("✅ Migration successful: All missing compliance columns added to 'agents' table!")
        
        await conn.close()
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    asyncio.run(run())

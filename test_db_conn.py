import asyncio
import asyncpg
import os
import certifi
from dotenv import load_dotenv

os.environ["SSL_CERT_FILE"] = certifi.where()

def test():
    load_dotenv("/Users/sakshi/Downloads/voice-agent/.env")
    db_url = os.getenv("DATABASE_URL")
    print(f"DATABASE_URL is: {'SET' if db_url else 'NOT SET'}")
    
    async def connect():
        print("Trying to connect via asyncpg...")
        try:
            conn = await asyncpg.connect(db_url, ssl="require")
            res = await conn.fetchval("SELECT 1")
            print(f"asyncpg connected successfully! DB responded with: {res}")
            
            # Check agents table
            count = await conn.fetchval("SELECT count(*) FROM agents")
            print(f"Agents in DB: {count}")
            
            await conn.close()
            return True
        except Exception as e:
            print(f"asyncpg connection failed: {e}")
            return False
            
    success = asyncio.run(connect())
    if not success:
        import sys
        sys.exit(1)

test()

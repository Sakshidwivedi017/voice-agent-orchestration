import os
import asyncio
import asyncpg
from dotenv import load_dotenv

print(f"Current Directory: {os.getcwd()}")
print(f"Reading from: {os.path.join(os.getcwd(), '.env')}")
load_dotenv()

async def list_tables():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env via os.getenv")
        return
    
    try:
        conn = await asyncpg.connect(db_url, ssl="require")
        rows = await conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        print("Tables in database:")
        for r in rows:
            print(f"- {r['table_name']}")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(list_tables())

import asyncio
import asyncpg
import os
import certifi
from dotenv import load_dotenv

os.environ["SSL_CERT_FILE"] = certifi.where()
load_dotenv()

async def main():
    db_url = os.getenv("DATABASE_URL")
    print(f"Connecting to: {db_url}")
    try:
        conn = await asyncpg.connect(db_url, ssl="require")
        res = await conn.fetchval("SELECT 1")
        print(f"Connected: {res}")
        await conn.close()
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(main())

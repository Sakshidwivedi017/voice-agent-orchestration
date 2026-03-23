import asyncio
import asyncpg
import os
from dotenv import load_dotenv

async def run():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    try:
        conn = await asyncpg.connect(db_url, ssl='require')
        # Check if the number +919315980744 exists in phone_numbers
        rows = await conn.fetch("SELECT * FROM phone_numbers WHERE phone_number LIKE '%9315980744%'")
        print(f"PHONE TABLE MATCHES: {rows}")
        
        # Also check which agents exist
        agents = await conn.fetch("SELECT id, user_id FROM agents LIMIT 5")
        print(f"RECENT AGENTS: {agents}")
        
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(run())

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv('DATABASE_URL')
    conn = await asyncpg.connect(db_url)
    
    # Check knowledge_chunks columns
    res_chunks = await conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'knowledge_chunks'")
    print("knowledge_chunks columns:", [r['column_name'] for r in res_chunks])
    
    # Check knowledge_files columns 
    res_files = await conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'knowledge_files'")
    print("knowledge_files columns:", [r['column_name'] for r in res_files])
    
    await conn.close()

if __name__ == "__main__":
    asyncio.run(run())

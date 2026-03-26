import asyncio
import asyncpg

async def list_tables():
    url = "postgresql://postgres:h%26qh5nW%3C@34.131.199.156:5432/agent_platform"
    try:
        conn = await asyncpg.connect(url, ssl="require")
        rows = await conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        print("Tables in database 'agent_platform':")
        for r in rows:
            print(f"- {r['table_name']}")
        
        # Check if users table has any data
        try:
            user_count = await conn.fetchval("SELECT count(*) FROM users")
            print(f"Users found: {user_count}")
        except Exception as e:
            print(f"Error checking users table: {e}")
            
        await conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(list_tables())

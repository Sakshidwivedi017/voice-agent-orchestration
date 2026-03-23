import asyncio
import asyncpg
import re

async def run():
    try:
        # Manually parse .env because of environment/sandboxing issues
        db_url = None
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('DATABASE_URL='):
                    db_url = line.split('=', 1)[1].strip().strip('"')
        
        if not db_url:
            print("Could not find DATABASE_URL in .env")
            return

        print(f"Connecting to DB...")
        conn = await asyncpg.connect(db_url, ssl='require')
        
        sql = """
        ALTER TABLE agents ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 20;
        ALTER TABLE agents ADD COLUMN IF NOT EXISTS ai_disclosure BOOLEAN DEFAULT TRUE;
        ALTER TABLE agents ADD COLUMN IF NOT EXISTS disclosure_text TEXT DEFAULT 'This call is handled by an AI assistant.';
        ALTER TABLE agents ADD COLUMN IF NOT EXISTS recording_announcement BOOLEAN DEFAULT TRUE;
        ALTER TABLE agents ADD COLUMN IF NOT EXISTS recording_script TEXT DEFAULT 'This call may be recorded for quality and training purposes.';
        ALTER TABLE agents ADD COLUMN IF NOT EXISTS transcription_enabled BOOLEAN DEFAULT TRUE;
        ALTER TABLE agents ADD COLUMN IF NOT EXISTS wait_time INTEGER DEFAULT 1;
        """
        
        print("Applying migration...")
        await conn.execute(sql)
        print("✅ Success! Database schema updated.")
        await conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(run())

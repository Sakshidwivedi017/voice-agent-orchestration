import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();

        const sql = `
            ALTER TABLE agents ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 20;
            ALTER TABLE agents ADD COLUMN IF NOT EXISTS ai_disclosure BOOLEAN DEFAULT TRUE;
            ALTER TABLE agents ADD COLUMN IF NOT EXISTS disclosure_text TEXT DEFAULT 'This call is handled by an AI assistant.';
            ALTER TABLE agents ADD COLUMN IF NOT EXISTS recording_announcement BOOLEAN DEFAULT TRUE;
            ALTER TABLE agents ADD COLUMN IF NOT EXISTS recording_script TEXT DEFAULT 'This call may be recorded for quality and training purposes.';
            ALTER TABLE agents ADD COLUMN IF NOT EXISTS transcription_enabled BOOLEAN DEFAULT TRUE;
            ALTER TABLE agents ADD COLUMN IF NOT EXISTS wait_time INTEGER DEFAULT 1;
            ALTER TABLE agents ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        `;

        await db.query(sql);

        return NextResponse.json({ message: '✅ Database columns added successfully!' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

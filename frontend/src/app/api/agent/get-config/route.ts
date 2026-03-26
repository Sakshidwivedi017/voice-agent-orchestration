import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user.id;
        const db = getDb();

        let agent;
        try {
            const agentResult = await db.query(
                `SELECT 
                    id, system_prompt, first_message, 
                    llm_model, stt_provider, tts_voice, 
                    transcription_enabled, wait_time,
                    max_capacity, ai_disclosure, disclosure_text,
                    recording_announcement, recording_script
                 FROM agents 
                 WHERE user_id = $1 
                 ORDER BY created_at DESC 
                 LIMIT 1`,
                [userId]
            );
            if (agentResult.rows.length === 0) {
                return NextResponse.json({ agent: null, files: [] });
            }
            agent = agentResult.rows[0];
        } catch (e: any) {
            if (e.message.includes('column "ai_disclosure" does not exist')) {
                console.warn("⚠️ Database schema is out of sync. Falling back to basic query. Run /api/z-setup-db to fix.");
                const fallbackResult = await db.query(
                    `SELECT id, system_prompt, first_message, llm_model, stt_provider, tts_voice
                     FROM agents WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
                    [userId]
                );
                if (fallbackResult.rows.length === 0) return NextResponse.json({ agent: null, files: [] });
                agent = {
                    ...fallbackResult.rows[0],
                    transcription_enabled: true, wait_time: 1, max_capacity: 20,
                    ai_disclosure: true, disclosure_text: 'AI Assistant',
                    recording_announcement: true, recording_script: 'Call recorded'
                };
            } else {
                throw e;
            }
        }

        // Fetch associated KB files
        const filesResult = await db.query(
            'SELECT id, file_name, file_url, created_at FROM knowledge_files WHERE agent_id = $1 ORDER BY created_at DESC',
            [agent.id]
        );

        return NextResponse.json({
            agent: agent,
            files: filesResult.rows
        });
    } catch (error: any) {
        console.error('Error fetching agent config:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

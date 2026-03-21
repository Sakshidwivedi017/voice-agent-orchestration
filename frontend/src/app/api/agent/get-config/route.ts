import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }

        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!UUID_REGEX.test(userId)) {
            return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
        }

        const db = getDb();

        const agentResult = await db.query(
            `SELECT 
                id, system_prompt, first_message, 
                llm_model, stt_provider, tts_voice, 
                transcription_enabled, wait_time 
             FROM agents 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [userId]
        );

        if (agentResult.rows.length === 0) {
            return NextResponse.json({ agent: null, files: [] });
        }

        const agent = agentResult.rows[0];

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

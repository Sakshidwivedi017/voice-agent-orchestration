import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            agent_id, user_id, system_prompt, first_message,
            llm_model, stt_provider, tts_voice,
            transcription_enabled, wait_time
        } = body;

        if (!user_id) {
            return NextResponse.json(
                { error: 'Missing required field: user_id' },
                { status: 400 }
            );
        }

        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!UUID_REGEX.test(user_id)) {
            return NextResponse.json({ error: 'Invalid user_id format' }, { status: 400 });
        }
        if (agent_id && !UUID_REGEX.test(agent_id)) {
            return NextResponse.json({ error: 'Invalid agent_id format' }, { status: 400 });
        }

        const db = getDb();

        let targetAgentId = agent_id;

        // If no agent_id passed, see if this user already has an agent
        if (!targetAgentId && user_id) {
            const existing = await db.query('SELECT id FROM agents WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [user_id]);
            if (existing.rows.length > 0) {
                targetAgentId = existing.rows[0].id;
            }
        }

        if (targetAgentId) {
            // Logic: If targetAgentId exists → UPDATE agents
            const updateResult = await db.query(
                `UPDATE agents 
                 SET system_prompt = $1, 
                     first_message = $2,
                     llm_model = $3,
                     stt_provider = $4,
                     tts_voice = $5,
                     transcription_enabled = $6,
                     wait_time = $7
                 WHERE id = $8`,
                [
                    system_prompt || '',
                    first_message || '',
                    llm_model || 'gpt-4o',
                    stt_provider || 'deepgram-nova-2',
                    tts_voice || 'el-rachel',
                    transcription_enabled ?? true,
                    wait_time ?? 1,
                    targetAgentId
                ]
            );

            if (updateResult.rowCount === 0) {
                return NextResponse.json(
                    { error: 'Agent not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ agent_id: targetAgentId, status: 'updated' });
        } else {
            // Logic: Else → INSERT new agent
            // Query: INSERT INTO agents (id, user_id, system_prompt, first_message, created_at)
            // VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING id;
            const insertResult = await db.query(
                `INSERT INTO agents 
                 (id, user_id, system_prompt, first_message, created_at, llm_model, stt_provider, tts_voice, transcription_enabled, wait_time, max_capacity, is_active) 
                 VALUES (gen_random_uuid(), $1, $2, $3, NOW(), $4, $5, $6, $7, $8, 20, true) 
                 RETURNING id`,
                [
                    user_id,
                    system_prompt || '',
                    first_message || '',
                    llm_model || 'gpt-4o',
                    stt_provider || 'deepgram-nova-2',
                    tts_voice || 'el-rachel',
                    transcription_enabled ?? true,
                    wait_time ?? 1
                ]
            );

            const newAgentId = insertResult.rows[0].id;
            return NextResponse.json({ agent_id: newAgentId, status: 'created' });
        }
    } catch (error: any) {
        console.error('Error saving agent config:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

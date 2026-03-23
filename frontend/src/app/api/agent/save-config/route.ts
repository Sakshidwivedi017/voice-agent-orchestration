import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user_id = user.id;
        const body = await req.json();
        const {
            agent_id, system_prompt, first_message,
            llm_model, stt_provider, tts_voice,
            transcription_enabled, wait_time,
            max_capacity, ai_disclosure, disclosure_text,
            recording_announcement, recording_script
        } = body;

        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (agent_id && !UUID_REGEX.test(agent_id)) {
            return NextResponse.json({ error: 'Invalid agent_id format' }, { status: 400 });
        }

        const db = getDb();
        let targetAgentId = agent_id;

        // If no agent_id passed, see if this user already has an agent
        if (!targetAgentId) {
            const existing = await db.query('SELECT id FROM agents WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [user_id]);
            if (existing.rows.length > 0) {
                targetAgentId = existing.rows[0].id;
            }
        }

        if (targetAgentId) {
            try {
                await db.query(
                    `UPDATE agents 
                     SET system_prompt = $1, 
                         first_message = $2,
                         llm_model = $3,
                         stt_provider = $4,
                         tts_voice = $5,
                         transcription_enabled = $6,
                         wait_time = $7,
                         max_capacity = $8,
                         ai_disclosure = $9,
                         disclosure_text = $10,
                         recording_announcement = $11,
                         recording_script = $12
                     WHERE id = $13 AND user_id = $14`,
                    [
                        system_prompt || '',
                        first_message || '',
                        llm_model || 'gpt-4o',
                        stt_provider || 'deepgram-nova-2',
                        tts_voice || 'el-rachel',
                        transcription_enabled ?? true,
                        wait_time ?? 1,
                        max_capacity ?? 20,
                        ai_disclosure ?? true,
                        disclosure_text || 'This call is handled by an AI assistant.',
                        recording_announcement ?? true,
                        recording_script || 'This call may be recorded for quality and training purposes.',
                        targetAgentId,
                        user_id
                    ]
                );
                return NextResponse.json({ agent_id: targetAgentId, status: 'updated' });
            } catch (e: any) {
                if (e.message.includes('column "ai_disclosure" does not exist')) {
                    console.warn("⚠️ Partial update performed - Missing columns. Run /api/z-setup-db");
                    await db.query(
                        `UPDATE agents SET system_prompt = $1, first_message = $2, llm_model = $3, stt_provider = $4, tts_voice = $5 
                         WHERE id = $6 AND user_id = $7`,
                        [system_prompt || '', first_message || '', llm_model || 'gpt-4o', stt_provider || 'deepgram-nova-2', tts_voice || 'el-rachel', targetAgentId, user_id]
                    );
                    return NextResponse.json({ agent_id: targetAgentId, status: 'partial_update_needed_migration' });
                }
                throw e;
            }
        } else {
            try {
                const insertResult = await db.query(
                    `INSERT INTO agents 
                     (id, user_id, system_prompt, first_message, created_at, llm_model, stt_provider, tts_voice, 
                      transcription_enabled, wait_time, max_capacity, is_active, 
                      ai_disclosure, disclosure_text, recording_announcement, recording_script) 
                     VALUES (gen_random_uuid(), $1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, true, $10, $11, $12, $13) 
                     RETURNING id`,
                    [
                        user_id, system_prompt || '', first_message || '', llm_model || 'gpt-4o',
                        stt_provider || 'deepgram-nova-2', tts_voice || 'el-rachel',
                        transcription_enabled ?? true, wait_time ?? 1, max_capacity ?? 20,
                        ai_disclosure ?? true, disclosure_text || 'This call is handled by an AI assistant.',
                        recording_announcement ?? true, recording_script || 'This call may be recorded for quality and training purposes.'
                    ]
                );
                return NextResponse.json({ agent_id: insertResult.rows[0].id, status: 'created' });
            } catch (e: any) {
                if (e.message.includes('column "ai_disclosure" does not exist')) {
                    console.warn("⚠️ Partial insert performed - Missing columns. Run /api/z-setup-db");
                    const minimalInsert = await db.query(
                        `INSERT INTO agents (id, user_id, system_prompt, first_message, llm_model, stt_provider, tts_voice, is_active) 
                         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true) RETURNING id`,
                        [user_id, system_prompt || '', first_message || '', llm_model || 'gpt-4o', stt_provider || 'deepgram-nova-2', tts_voice || 'el-rachel']
                    );
                    return NextResponse.json({ agent_id: minimalInsert.rows[0].id, status: 'partial_create_needed_migration' });
                }
                throw e;
            }
        }
    } catch (error: any) {
        console.error('Error saving agent config:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

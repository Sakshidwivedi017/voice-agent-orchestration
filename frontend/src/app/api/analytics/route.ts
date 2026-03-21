import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const agent_id = searchParams.get('agent_id');

        const db = getDb();

        let query = '';
        let params: any[] = [];

        if (agent_id) {
            const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!UUID_REGEX.test(agent_id)) {
                return NextResponse.json({ error: 'Invalid agent_id format' }, { status: 400 });
            }

            // Explicitly ensure the caller owns the intended agent_id 
            // Thus preventing IDOR (Insecure Direct Object Reference)
            const agentCheck = await db.query('SELECT id FROM agents WHERE id = $1 AND user_id = $2', [agent_id, user.id]);
            if (agentCheck.rows.length === 0) {
                return NextResponse.json({ error: 'Agent not found or unauthorized' }, { status: 404 });
            }

            query = `SELECT * FROM call_logs WHERE agent_id = $1 ORDER BY created_at DESC LIMIT 50`;
            params = [agent_id];
        } else {
            // Optional fallback: Fetch all calls across all of the user's agents securely
            query = `
                SELECT cl.* 
                FROM call_logs cl
                JOIN agents a ON cl.agent_id = a.id
                WHERE a.user_id = $1
                ORDER BY cl.created_at DESC 
                LIMIT 50
            `;
            params = [user.id];
        }

        const result = await db.query(query, params);

        return NextResponse.json({
            message: 'Analytics fetched successfully',
            logs: result.rows
        }, { status: 200 });

    } catch (error: any) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

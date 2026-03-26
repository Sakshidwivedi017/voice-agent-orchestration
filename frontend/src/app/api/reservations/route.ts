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

        const { searchParams } = new URL(req.url);
        const agentId = searchParams.get('agent_id');

        if (!agentId) {
            return NextResponse.json({ error: 'agent_id is required' }, { status: 400 });
        }

        const db = getDb();

        // Security Check: Ensure the user owns this agent
        const agentCheck = await db.query(
            'SELECT id FROM agents WHERE id = $1 AND user_id = $2',
            [agentId, user.id]
        );

        if (agentCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Agent not found or unauthorized' }, { status: 404 });
        }

        const result = await db.query(
            `SELECT id, customer_name, phone, date, time::text as time, guests, status, special_request, created_at 
             FROM reservations 
             WHERE agent_id = $1 
             ORDER BY created_at DESC`,
            [agentId]
        );

        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('Error fetching reservations:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

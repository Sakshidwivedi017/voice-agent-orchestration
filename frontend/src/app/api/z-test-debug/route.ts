import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const db = getDb();
    const agents = await db.query('SELECT * FROM agents LIMIT 5');
    const files = await db.query('SELECT * FROM knowledge_files LIMIT 5');
    return NextResponse.json({ agents: agents.rows, files: files.rows });
}

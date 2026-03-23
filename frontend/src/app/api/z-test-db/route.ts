import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();

        const constr = await db.query(`
            SELECT t.relname as table_name, conname, contype, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname IN ('phone_numbers', 'agents', 'users');
        `);

        // Check for orphan phone_numbers 
        const orphansPn = await db.query(`
            SELECT id, user_id FROM phone_numbers WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);
        `);

        // Check for orphan agents mapping
        const orphansAgents = await db.query(`
            SELECT id, phone_number_id FROM agents WHERE phone_number_id IS NOT NULL AND phone_number_id NOT IN (SELECT id FROM phone_numbers);
        `);

        // existing idx
        const idxInfo = await db.query(`
             SELECT tablename, indexname, indexdef 
             FROM pg_indexes 
             WHERE tablename IN ('phone_numbers', 'agents', 'users');
        `);

        return NextResponse.json({
            constraints: constr.rows,
            orphansPn: orphansPn.rows,
            orphansAgents: orphansAgents.rows,
            indexes: idxInfo.rows
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

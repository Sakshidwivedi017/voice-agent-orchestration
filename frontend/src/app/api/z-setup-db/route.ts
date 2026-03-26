import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();

        const sql = `
            -- Users Table for Admin Login
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Agents Table
            CREATE TABLE IF NOT EXISTS agents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id),
                name TEXT NOT NULL,
                system_prompt TEXT,
                first_message TEXT,
                voice_id TEXT DEFAULT 'kavya',
                phone_number_id TEXT,
                max_capacity INTEGER DEFAULT 20,
                ai_disclosure BOOLEAN DEFAULT TRUE,
                disclosure_text TEXT DEFAULT 'This call is handled by an AI assistant.',
                recording_announcement BOOLEAN DEFAULT TRUE,
                recording_script TEXT DEFAULT 'This call may be recorded for quality and training purposes.',
                transcription_enabled BOOLEAN DEFAULT TRUE,
                wait_time INTEGER DEFAULT 1,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Phone Numbers Table
            CREATE TABLE IF NOT EXISTS phone_numbers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agent_id UUID REFERENCES agents(id),
                phone_number TEXT UNIQUE NOT NULL,
                label TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Reservations Table
            CREATE TABLE IF NOT EXISTS reservations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agent_id UUID REFERENCES agents(id),
                customer_name TEXT NOT NULL,
                phone TEXT,
                date DATE NOT NULL,
                time TIME NOT NULL,
                guests INTEGER,
                status TEXT DEFAULT 'confirmed',
                special_request TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Call Logs Table (Enhanced)
            CREATE TABLE IF NOT EXISTS call_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agent_id UUID REFERENCES agents(id),
                caller_number TEXT,
                phone_number TEXT,
                duration INTEGER,
                intent TEXT,
                summary TEXT,
                transcript TEXT,
                status TEXT DEFAULT 'resolved',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Knowledge Chunks for RAG
            CREATE TABLE IF NOT EXISTS knowledge_chunks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agent_id UUID REFERENCES agents(id),
                content TEXT NOT NULL,
                embedding VECTOR(1536),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;

        await db.query(sql);

        return NextResponse.json({
            message: '✅ Database setup complete! All tables (users, agents, phone_numbers, reservations, call_logs, knowledge_chunks) are confirmed.',
            status: 'success'
        });
    } catch (error: any) {
        console.error('Database Setup Error:', error);
        return NextResponse.json({
            error: error.message,
            hint: 'Ensure your DATABASE_URL in Vercel is correct and your Postgres DB is accessible.'
        }, { status: 500 });
    }
}

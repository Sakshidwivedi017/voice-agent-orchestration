import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { setCookieSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password || password.length < 6) {
            return NextResponse.json(
                { error: 'Valid email and password (min 6 chars) are required' },
                { status: 400 }
            );
        }

        const db = getDb();

        // 1. Check if user already exists
        const existingQuery = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingQuery.rowCount && existingQuery.rowCount > 0) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Insert user into DB and let postgres generate the UUID
        const result = await db.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
            [email, passwordHash]
        );
        const userId = result.rows[0].id;

        // 4. Set session cookie
        const userPayload = { id: userId, email };
        const token = await setCookieSession(userPayload);

        return NextResponse.json({
            message: 'User created successfully',
            user: userPayload,
            token,
        }, { status: 201 });

    } catch (error) {
        console.error('Signup Error:', error);
        return NextResponse.json(
            { error: 'Internal server error during signup' },
            { status: 500 }
        );
    }
}

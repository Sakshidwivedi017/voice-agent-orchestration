import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { setCookieSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const db = getDb();

        // 1. Find user by email
        const userQuery = await db.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
        const user = userQuery.rows[0];

        if (!user) {
            return NextResponse.json(
                { error: 'User does not exist. Please sign up first.' },
                { status: 404 }
            );
        }

        // 2. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // 3. Set session cookie
        const userPayload = { id: user.id, email: user.email };
        await setCookieSession(userPayload);

        return NextResponse.json({
            message: 'Logged in successfully',
            user: userPayload,
        }, { status: 200 });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json(
            { error: 'Internal server error during login' },
            { status: 500 }
        );
    }
}

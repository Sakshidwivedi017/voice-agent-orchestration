import { NextResponse } from 'next/server';
import { clearCookieSession } from '@/lib/auth';

export async function POST() {
    try {
        await clearCookieSession();

        return NextResponse.json({
            message: 'Logged out successfully',
        }, { status: 200 });
    } catch (error) {
        console.error('Logout Error:', error);
        return NextResponse.json(
            { error: 'Internal server error during logout' },
            { status: 500 }
        );
    }
}

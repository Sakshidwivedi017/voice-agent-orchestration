import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /voice-client routes
    if (pathname.startsWith('/voice-client')) {
        const token = request.cookies.get('voice_client_session')?.value;

        // If no token, redirect to auth page
        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth';
            return NextResponse.redirect(url);
        }
    }

    // If authenticated user tries to access auth page, redirect to dashboard
    if (pathname === '/auth') {
        const token = request.cookies.get('voice_client_session')?.value;
        if (token) {
            const url = request.nextUrl.clone();
            url.pathname = '/voice-client';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/voice-client/:path*', '/auth'],
};

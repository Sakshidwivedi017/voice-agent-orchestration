import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
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

        // Verify token cryptographically
        const user = await verifyToken(token);
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth';
            const response = NextResponse.redirect(url);
            response.cookies.delete('voice_client_session');
            return response;
        }

        // Pass extracted user_id to downstream routes via header
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', user.id);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // If authenticated user tries to access auth page, redirect to dashboard
    if (pathname === '/auth') {
        const token = request.cookies.get('voice_client_session')?.value;
        if (token) {
            const user = await verifyToken(token);
            if (user) {
                const url = request.nextUrl.clone();
                url.pathname = '/voice-client';
                return NextResponse.redirect(url);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/voice-client/:path*', '/auth'],
};

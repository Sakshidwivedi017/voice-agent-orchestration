import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only';
const COOKIE_NAME = 'voice_client_session';

export interface AuthUser {
    id: string;
    email: string;
}

// Helper to base64url encode/decode
function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): Uint8Array {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// Convert SECRET to CryptoKey
async function getCryptoKey() {
    const encoder = new TextEncoder();
    return await crypto.subtle.importKey(
        'raw',
        encoder.encode(JWT_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

/**
 * Generates a signed JWT token for the user using Web Crypto
 */
export async function signToken(user: AuthUser): Promise<string> {
    const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
    const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ ...user, exp })));

    const key = await getCryptoKey();
    const prefix = `${header}.${payload}`;
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(prefix));
    const signature = base64UrlEncode(signatureBuffer);

    return `${prefix}.${signature}`;
}

/**
 * Verifies a JWT token using Web Crypto and returns the decoded payload
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const [headerB64, payloadB64, signatureB64] = parts;
        const key = await getCryptoKey();

        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            base64UrlDecode(signatureB64) as BufferSource,
            new TextEncoder().encode(`${headerB64}.${payloadB64}`)
        );

        if (!isValid) return null;

        const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
        const payload = JSON.parse(payloadJson);

        if (payload.exp && Date.now() / 1000 > payload.exp) {
            return null; // Expired
        }

        return {
            id: payload.id,
            email: payload.email
        };
    } catch (e) {
        return null;
    }
}

/**
 * Sets the JWT token in an HTTP-only cookie and returns it
 */
export async function setCookieSession(user: AuthUser): Promise<string> {
    const token = await signToken(user);
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });

    return token;
}

/**
 * Clears the authentication cookie
 */
export async function clearCookieSession() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

/**
 * Validates the current session from the cookies and returns the user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    return await verifyToken(token);
}

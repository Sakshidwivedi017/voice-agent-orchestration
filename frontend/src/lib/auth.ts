import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only';
const COOKIE_NAME = 'voice_client_session';

export interface AuthUser {
    id: string;
    email: string;
}

/**
 * Generates a signed JWT token for the user
 */
export function signToken(user: AuthUser): string {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies a JWT token and returns the decoded payload
 */
export function verifyToken(token: string): AuthUser | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthUser;
    } catch (e) {
        return null;
    }
}

/**
 * Sets the JWT token in an HTTP-only cookie
 */
export async function setCookieSession(user: AuthUser) {
    const token = signToken(user);
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
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

    return verifyToken(token);
}

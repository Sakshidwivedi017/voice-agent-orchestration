'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import WaveformBackground from '@/components/effects/WaveformBackground';
import { Surface } from '@/components/ui/layout/Surface';
import { Stack } from '@/components/ui/layout/Stack';
import { Container } from '@/components/ui/layout/Container';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { Button } from '@/components/ui/forms/Button';
import { Input } from '@/components/ui/forms/Input';
import styles from './page.module.css';

export default function AuthPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Success, redirect to dashboard
            router.push('/voice-client');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.authMain}>
            <WaveformBackground />

            <Container maxWidth="sm" className={styles.authContainer}>
                <Surface padding="xl" elevation="lg" radius="xl" className={styles.authCard}>
                    <Stack gap="24">
                        <div className={styles.authHeader}>
                            <div className={styles.logoIcon}></div>
                            <Heading as="h1" size="lg">
                                {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                            </Heading>
                            <Text size="sm" tone="muted">
                                {mode === 'login'
                                    ? 'Log in to access your Voice Agent Dashboard.'
                                    : 'Sign up to configure and deploy your AI agents.'}
                            </Text>
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.authForm}>
                            <Stack gap="16">
                                <div className={styles.fieldRow}>
                                    <Text size="sm" weight="medium">Email Address</Text>
                                    <Input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        inputSize="lg"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className={styles.fieldRow}>
                                    <Text size="sm" weight="medium">Password</Text>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        inputSize="lg"
                                        disabled={isLoading}
                                        endAdornment={
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={styles.eyeBtn || ''}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', color: 'var(--color-text-muted)' }}
                                            >
                                                {showPassword ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                )}
                                            </button>
                                        }
                                    />
                                </div>
                                {mode === 'signup' && (
                                    <div className={styles.fieldRow}>
                                        <Text size="sm" weight="medium">Confirm Password</Text>
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            inputSize="lg"
                                            disabled={isLoading}
                                            endAdornment={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className={styles.eyeBtn || ''}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', color: 'var(--color-text-muted)' }}
                                                >
                                                    {showConfirmPassword ? (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                                    ) : (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                    )}
                                                </button>
                                            }
                                        />
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    variant="brand"
                                    size="lg"
                                    fullWidth
                                    disabled={isLoading}
                                    className={styles.submitBtn}
                                >
                                    {isLoading
                                        ? 'Please wait...'
                                        : mode === 'login' ? 'Log in to Dashboard' : 'Create Account'
                                    }
                                </Button>
                            </Stack>
                        </form>

                        <div className={styles.authFooter}>
                            <Text size="sm" tone="muted">
                                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                                {' '}
                                <button
                                    className={styles.toggleBtn}
                                    onClick={() => {
                                        setMode(mode === 'login' ? 'signup' : 'login');
                                        setError('');
                                        setConfirmPassword('');
                                    }}
                                    type="button"
                                >
                                    {mode === 'login' ? 'Sign up' : 'Log in'}
                                </button>
                            </Text>
                        </div>
                    </Stack>
                </Surface>
            </Container>
        </main>
    );
}

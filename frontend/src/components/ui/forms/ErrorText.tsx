import React from 'react';
import { cn } from '@/lib/cn';
import styles from './ErrorText.module.css';

export interface ErrorTextProps {
    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Error message content
     */
    children: React.ReactNode;
}

/**
 * ErrorText component for validation feedback.
 */
export function ErrorText({ className, children }: ErrorTextProps) {
    return (
        <p className={cn(styles.errorText, className)} role="alert">
            {children}
        </p>
    );
}

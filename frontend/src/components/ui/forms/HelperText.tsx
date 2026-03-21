import React from 'react';
import { cn } from '@/lib/cn';
import styles from './HelperText.module.css';

export interface HelperTextProps {
    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Helper text content
     */
    children: React.ReactNode;
}

/**
 * HelperText component for provided hints or information.
 */
export function HelperText({ className, children }: HelperTextProps) {
    return (
        <p className={cn(styles.helperText, className)}>
            {children}
        </p>
    );
}

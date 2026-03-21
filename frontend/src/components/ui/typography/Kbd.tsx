import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Kbd.module.css';

export interface KbdProps {
    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Content (keyboard key)
     */
    children: React.ReactNode;
}

/**
 * Kbd component for displaying keyboard shortcuts and keys.
 * 
 * @example
 * <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd>
 * <Kbd>⌘</Kbd><Kbd>K</Kbd>
 */
export function Kbd({ className, children }: KbdProps) {
    return (
        <kbd className={cn(styles.kbd, className)}>
            {children}
        </kbd>
    );
}

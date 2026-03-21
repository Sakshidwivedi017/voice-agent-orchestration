'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/cn';
import styles from './MobileMenu.module.css';

export interface MobileMenuProps {
    /**
     * Trigger element (usually a hamburger button)
     */
    trigger: React.ReactNode;

    /**
     * Menu content
     */
    children: React.ReactNode;

    /**
     * Menu title for accessibility
     */
    title?: string;
}

/**
 * MobileMenu component that slides in from the right.
 * Uses Radix Dialog for focus management and accessibility.
 */
export function MobileMenu({
    trigger,
    children,
    title = '',
}: MobileMenuProps) {
    return (
        <DialogPrimitive.Root>
            <DialogPrimitive.Trigger asChild>
                {trigger}
            </DialogPrimitive.Trigger>

            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className={styles.overlay} />
                <DialogPrimitive.Content className={styles.content}>
                    <DialogPrimitive.Title className={styles.srOnly}>
                        {title || 'Navigation Menu'}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className={styles.srOnly}>
                        Mobile navigation menu
                    </DialogPrimitive.Description>
                    <div className={styles.header}>
                        <DialogPrimitive.Close className={styles.close} aria-label="Close">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </DialogPrimitive.Close>
                    </div>

                    <div className={styles.body}>
                        {children}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

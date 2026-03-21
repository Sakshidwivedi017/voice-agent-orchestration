'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/cn';
import styles from './Dialog.module.css';

export interface DialogProps {
    /**
     * Open state (controlled)
     */
    open?: boolean;

    /**
     * Callback when open state changes
     */
    onOpenChange?: (open: boolean) => void;

    /**
     * Trigger element (optional)
     */
    trigger?: React.ReactNode;

    /**
     * Dialog title
     */
    title: string;

    /**
     * Dialog description
     */
    description?: string;

    /**
     * Content
     */
    children: React.ReactNode;
}

/**
 * Dialog component using Radix primitives.
 * Includes overlay, focus trap, and ESC to close.
 * 
 * @example
 * <Dialog title="Confirm Action" description="Are you sure?">
 *   <Button>Confirm</Button>
 * </Dialog>
 */
export function Dialog({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    children,
}: DialogProps) {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            {trigger && (
                <DialogPrimitive.Trigger asChild>
                    {trigger}
                </DialogPrimitive.Trigger>
            )}

            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className={styles.overlay} />

                <DialogPrimitive.Content className={styles.content}>
                    <div className={styles.header}>
                        {title && (
                            <DialogPrimitive.Title className={styles.title}>
                                {title}
                            </DialogPrimitive.Title>
                        )}
                        {description && (
                            <DialogPrimitive.Description className={styles.description}>
                                {description}
                            </DialogPrimitive.Description>
                        )}
                        <DialogPrimitive.Close className={styles.close} aria-label="Close">
                            ×
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

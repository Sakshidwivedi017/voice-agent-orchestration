'use client';

import React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/cn';
import styles from './Popover.module.css';

export interface PopoverProps {
    /**
     * Trigger element
     */
    trigger: React.ReactNode;

    /**
     * Content to display in the popover
     */
    children: React.ReactNode;

    /**
     * Open state (controlled)
     */
    open?: boolean;

    /**
     * Callback when open state changes
     */
    onOpenChange?: (open: boolean) => void;

    /**
     * Additional CSS classes for the content
     */
    className?: string;
}

/**
 * Popover component for floating content anchored to a trigger.
 */
export function Popover({
    trigger,
    children,
    open,
    onOpenChange,
    className,
}: PopoverProps) {
    return (
        <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <PopoverPrimitive.Trigger asChild>
                {trigger}
            </PopoverPrimitive.Trigger>

            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                    className={cn(styles.content, className)}
                    sideOffset={8}
                >
                    {children}
                    <PopoverPrimitive.Arrow className={styles.arrow} />
                </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
    );
}

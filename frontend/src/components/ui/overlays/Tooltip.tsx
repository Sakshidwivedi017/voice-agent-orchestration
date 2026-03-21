'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/cn';
import styles from './Tooltip.module.css';

export interface TooltipProps {
    /**
     * Trigger element
     */
    children: React.ReactNode;

    /**
     * Content to display in the tooltip
     */
    content: React.ReactNode;

    /**
     * Side to display the tooltip
     * @default 'top'
     */
    side?: 'top' | 'right' | 'bottom' | 'left';

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * Tooltip component for informative hover text.
 */
export function Tooltip({
    children,
    content,
    side = 'top',
    className,
}: TooltipProps) {
    return (
        <TooltipPrimitive.Provider delayDuration={300}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    {children}
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        className={cn(styles.content, className)}
                        side={side}
                        sideOffset={4}
                    >
                        {content}
                        <TooltipPrimitive.Arrow className={styles.arrow} />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
}

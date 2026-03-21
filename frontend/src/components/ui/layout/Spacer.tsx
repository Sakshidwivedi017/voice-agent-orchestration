import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Spacer.module.css';

export interface SpacerProps {
    /**
     * Spacing axis
     * @default 'vertical'
     */
    axis?: 'horizontal' | 'vertical';

    /**
     * Spacing size from tokens
     * @default '16'
     */
    size?: '2' | '4' | '8' | '12' | '16' | '24' | '32' | '48' | '64';

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * Spacer component for fixed spacing between elements.
 */
export function Spacer({
    axis = 'vertical',
    size = '16',
    className,
}: SpacerProps) {
    return (
        <div
            className={cn(
                styles.spacer,
                styles[`axis-${axis}`],
                styles[`size-${size}`],
                className
            )}
            aria-hidden="true"
        />
    );
}

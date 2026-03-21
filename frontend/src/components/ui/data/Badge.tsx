import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Badge.module.css';

export interface BadgeProps {
    /**
     * Badge variant
     * @default 'neutral'
     */
    variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Content
     */
    children: React.ReactNode;
}

/**
 * Badge component for status indicators and labels.
 * 
 * @example
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning">Pending</Badge>
 */
export function Badge({
    variant = 'neutral',
    className,
    children,
}: BadgeProps) {
    return (
        <span className={cn(styles.badge, styles[`variant-${variant}`], className)}>
            {children}
        </span>
    );
}

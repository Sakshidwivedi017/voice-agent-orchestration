import React from 'react';
import { cn } from '@/lib/cn';
import styles from './AspectRatio.module.css';

export interface AspectRatioProps {
    /**
     * Aspect ratio (e.g., "16/9" or 1.777)
     * @default '1/1'
     */
    ratio?: string | number;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Content to maintain aspect ratio
     */
    children: React.ReactNode;
}

/**
 * AspectRatio component for maintaining consistent proportions for media or containers.
 */
export function AspectRatio({
    ratio = '1/1',
    className,
    children,
}: AspectRatioProps) {
    return (
        <div
            className={cn(styles.aspectRatio, className)}
            style={{ aspectRatio: ratio } as React.CSSProperties}
        >
            {children}
        </div>
    );
}

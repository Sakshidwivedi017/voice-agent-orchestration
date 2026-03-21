import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
    /**
     * Responsive width
     */
    width?: string | number;

    /**
     * Responsive height
     */
    height?: string | number;

    /**
     * Rounded or circle
     * @default 'md'
     */
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Shimmer animation
     * @default true
     */
    shimmer?: boolean;
}

/**
 * Skeleton component for loading state placeholders.
 */
export function Skeleton({
    width = '100%',
    height = '1em',
    radius = 'md',
    shimmer = true,
    className,
}: SkeletonProps) {
    return (
        <div
            className={cn(
                styles.skeleton,
                styles[`radius-${radius}`],
                shimmer && styles.shimmer,
                className
            )}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
            }}
        />
    );
}

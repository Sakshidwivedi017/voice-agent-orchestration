import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Surface.module.css';

export interface SurfaceProps extends React.HTMLAttributes<HTMLElement> {
    /**
     * Padding size
     * @default 'md'
     */
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

    /**
     * Elevation/shadow level
     * @default 'sm'
     */
    elevation?: 'none' | 'sm' | 'md' | 'lg';

    /**
     * Border radius
     * @default 'md'
     */
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

    /**
     * HTML element to render or React component
     * @default 'div'
     */
    as?: React.ElementType;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Content
     */
    children: React.ReactNode;

    /**
     * Allow any other props (e.g. href for Link)
     */
    [key: string]: any;
}

/**
 * Surface component for cards and elevated content areas.
 * Optimized for dark background (#050505).
 * 
 * @example
 * <Surface padding="lg" elevation="md">
 *   <Heading size="lg">Card Title</Heading>
 *   <Text>Card content</Text>
 * </Surface>
 */
export function Surface({
    padding = 'md',
    elevation = 'sm',
    radius = 'md',
    as: Component = 'div',
    className,
    children,
    ...props
}: SurfaceProps) {
    return (
        <Component
            {...props}
            className={cn(
                styles.surface,
                styles[`padding-${padding}`],
                styles[`elevation-${elevation}`],
                styles[`radius-${radius}`],
                className
            )}
        >
            {children}
        </Component>
    );
}

import React from 'react';
import { cn } from '@/lib/cn';
import styles from './GridItem.module.css';

type ResponsiveValue<T> = T | { base?: T; md?: T; lg?: T };

function getResponsiveClasses<T extends string | number>(
    value: ResponsiveValue<T> | undefined,
    prefix: string
): string {
    if (!value) return '';

    if (typeof value === 'object') {
        const classes: string[] = [];
        if (value.base) classes.push(`${prefix}-${value.base}`);
        if (value.md) classes.push(`${prefix}-md-${value.md}`);
        if (value.lg) classes.push(`${prefix}-lg-${value.lg}`);
        return classes.join(' ');
    }

    return `${prefix}-${value}`;
}

export interface GridItemProps {
    /**
     * Column span (1-12)
     * @default 1
     */
    span?: ResponsiveValue<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>;

    /**
     * Column start position (1-12)
     */
    start?: ResponsiveValue<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>;

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
 * Grid item with responsive span and start position.
 * 
 * @example
 * <GridItem span={{ base: 12, md: 6, lg: 4 }}>
 *   Content
 * </GridItem>
 */
export function GridItem({
    span,
    start,
    className,
    children,
}: GridItemProps) {
    return (
        <div
            className={cn(
                getResponsiveClasses(span, 'span'),
                getResponsiveClasses(start, 'start'),
                className
            )}
        >
            {children}
        </div>
    );
}

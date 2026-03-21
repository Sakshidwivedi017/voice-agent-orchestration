import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Grid.module.css';

type ResponsiveValue<T> = T | { base?: T; sm?: T; md?: T; lg?: T };

function getResponsiveClasses<T extends string | number>(
    value: ResponsiveValue<T> | undefined,
    prefix: string,
    styles: Record<string, string>
): string {
    if (!value) return '';

    if (typeof value === 'object') {
        const classes: string[] = [];
        if (value.base) classes.push(styles[`${prefix}-${value.base}`]);
        if (value.sm) classes.push(styles[`${prefix}-sm-${value.sm}`]);
        if (value.md) classes.push(styles[`${prefix}-md-${value.md}`]);
        if (value.lg) classes.push(styles[`${prefix}-lg-${value.lg}`]);
        return classes.filter(Boolean).join(' ');
    }

    return styles[`${prefix}-${value}`] || '';
}

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Number of columns (1-12)
     * @default 12
     */
    columns?: ResponsiveValue<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>;

    /**
     * Gap between items
     * @default '16'
     */
    gap?: '2' | '4' | '8' | '12' | '16' | '24' | '32' | '48' | '64';

    /**
     * Vertical alignment of items
     */
    align?: 'start' | 'center' | 'end' | 'stretch';

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
 * Grid container with 12-column system and responsive behavior.
 * 
 * @example
 * <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="24" align="center">
 *   <GridItem>Content</GridItem>
 * </Grid>
 */
export function Grid({
    columns = 12,
    gap = '16',
    align,
    className,
    children,
    ...props
}: GridProps) {
    const columnClasses = getResponsiveClasses(columns, 'columns', styles);

    return (
        <div
            {...props}
            className={cn(
                styles.grid,
                columnClasses,
                styles[`gap-${gap}`],
                align && styles[`align-${align}`],
                className
            )}
        >
            {children}
        </div>
    );
}

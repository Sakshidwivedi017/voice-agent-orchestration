import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Stack.module.css';

export interface StackProps {
    /**
     * Gap between children (maps to spacing tokens)
     * @default '16'
     */
    gap?: '0' | '2' | '4' | '8' | '12' | '16' | '24' | '32' | '48' | '64';

    /**
     * Cross-axis alignment
     * @default 'stretch'
     */
    align?: 'start' | 'center' | 'end' | 'stretch';

    /**
     * HTML element to render
     * @default 'div'
     */
    as?: keyof JSX.IntrinsicElements;

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
 * Stack component for vertical layouts with gap-based spacing.
 * Uses CSS flexbox gap property - no wrapper elements per child.
 * 
 * @example
 * <Stack gap="24">
 *   <Text>Item 1</Text>
 *   <Text>Item 2</Text>
 * </Stack>
 */
export function Stack({
    gap = '16',
    align = 'stretch',
    as: Component = 'div',
    className,
    children,
}: StackProps) {
    return (
        <Component
            className={cn(styles.stack, styles[`gap-${gap}`], styles[`align-${align}`], className)}
        >
            {children}
        </Component>
    );
}

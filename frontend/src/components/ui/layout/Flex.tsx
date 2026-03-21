import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Flex.module.css';

export interface FlexProps {
    /**
     * Layout direction
     * @default 'row'
     */
    direction?: 'row' | 'column';

    /**
     * Flex wrap
     * @default 'nowrap'
     */
    wrap?: 'nowrap' | 'wrap';

    /**
     * Align items
     * @default 'stretch'
     */
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';

    /**
     * Justify content
     * @default 'start'
     */
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';

    /**
     * Gap between items
     * @default '0'
     */
    gap?: '0' | '2' | '4' | '8' | '12' | '16' | '24' | '32' | '48' | '64';

    /**
     * HTML element to render
     * @default 'div'
     */
    as?: keyof JSX.IntrinsicElements;

    /**
     * Full width
     * @default false
     */
    fullWidth?: boolean;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Children content
     */
    children?: React.ReactNode;
}

/**
 * Flex component for flexible layouts.
 */
export function Flex({
    direction = 'row',
    wrap = 'nowrap',
    align = 'stretch',
    justify = 'start',
    gap = '0',
    as: Component = 'div',
    fullWidth = false,
    className,
    children,
}: FlexProps) {
    return (
        <Component
            className={cn(
                styles.flex,
                styles[`direction-${direction}`],
                styles[`wrap-${wrap}`],
                styles[`align-${align}`],
                styles[`justify-${justify}`],
                styles[`gap-${gap}`],
                fullWidth && styles.fullWidth,
                className
            )}
        >
            {children}
        </Component>
    );
}

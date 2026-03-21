import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Cluster.module.css';

export interface ClusterProps {
    /**
     * Gap between items
     * @default '8'
     */
    gap?: '2' | '4' | '8' | '12' | '16' | '24';

    /**
     * Horizontal alignment
     * @default 'start'
     */
    justify?: 'start' | 'center' | 'end' | 'between';

    /**
     * Vertical alignment
     * @default 'center'
     */
    align?: 'start' | 'center' | 'end';

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
 * Cluster component for inline wrapping layouts (badges, buttons, tags).
 * Uses CSS flexbox with wrap and gap.
 * 
 * @example
 * <Cluster gap="12" justify="center">
 *   <button>Button 1</button>
 *   <button>Button 2</button>
 * </Cluster>
 */
export function Cluster({
    gap = '8',
    justify = 'start',
    align = 'center',
    as: Component = 'div',
    className,
    children,
}: ClusterProps) {
    return (
        <Component
            className={cn(
                styles.cluster,
                styles[`gap-${gap}`],
                styles[`justify-${justify}`],
                styles[`align-${align}`],
                className
            )}
        >
            {children}
        </Component>
    );
}

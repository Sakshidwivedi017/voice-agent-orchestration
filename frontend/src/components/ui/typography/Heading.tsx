import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Heading.module.css';

export interface HeadingProps {
    /**
     * HTML heading element to render
     * @default 'h2'
     */
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    /**
     * Visual size (independent of semantic level)
     * @default matches the 'as' prop level
     */
    size?: 'display' | 'xxl' | 'xl' | 'lg' | 'md' | 'sm';

    /**
     * Text alignment
     * @default 'left'
     */
    align?: 'left' | 'center' | 'right';

    /**
     * Font weight
     * @default 'semibold'
     */
    weight?: 'light' | 'medium' | 'semibold' | 'bold';

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
 * Heading component for headings h1-h6 with configurable visual size.
 * Maintains semantic HTML hierarchy while allowing visual flexibility.
 * 
 * @example
 * <Heading as="h1" size="display">Hero Heading</Heading>
 * <Heading as="h2" size="xl">Section Title</Heading>
 * <Heading as="h3" align="center">Centered Title</Heading>
 */
export function Heading({
    as: Component = 'h2',
    size,
    weight,
    align = 'left',
    className,
    children,
}: HeadingProps) {
    // Default size based on heading level if not specified
    const defaultSizes: Record<string, HeadingProps['size']> = {
        h1: 'xxl',
        h2: 'xl',
        h3: 'lg',
        h4: 'md',
        h5: 'sm',
        h6: 'sm',
    };

    const appliedSize = size || defaultSizes[Component];

    return (
        <Component
            className={cn(
                styles.heading,
                styles[`size-${appliedSize}`],
                styles[`align-${align}`],
                weight && styles[`weight-${weight}`],
                className
            )}
        >
            {children}
        </Component>
    );
}

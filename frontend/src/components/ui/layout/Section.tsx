import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Section.module.css';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    /**
     * Vertical padding size
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * HTML element to render
     * @default 'section'
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
}

/**
 * Section component for consistent vertical spacing.
 * 
 * @example
 * <Section size="lg" id="features">
 *   <Heading>Section Title</Heading>
 * </Section>
 */
export function Section({
    size = 'md',
    as: Component = 'section',
    className,
    children,
    ...props
}: SectionProps) {
    return (
        <Component
            {...props}
            className={cn(styles.section, styles[`size-${size}`], className)}
        >
            {children}
        </Component>
    );
}

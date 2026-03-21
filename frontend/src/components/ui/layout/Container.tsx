import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Container.module.css';

export interface ContainerProps {
    /**
     * Maximum width preset
     * @default 'lg'
     */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'layout';

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
 * Container component for constraining content width with responsive padding.
 * 
 * @example
 * <Container maxWidth="md">
 *   <Heading>Contained Content</Heading>
 * </Container>
 */
export function Container({
    maxWidth = 'layout',
    className,
    children,
}: ContainerProps) {
    return (
        <div className={cn(styles.container, styles[`max-${maxWidth}`], className)}>
            {children}
        </div>
    );
}

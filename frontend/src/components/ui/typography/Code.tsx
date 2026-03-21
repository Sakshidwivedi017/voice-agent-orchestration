import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Code.module.css';

export interface CodeProps {
    /**
     * Variant: inline or block
     * @default 'inline'
     */
    variant?: 'inline' | 'block';

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
 * Code component for displaying code inline or in blocks.
 * 
 * @example
 * <Code>const foo = 'bar';</Code>
 * <Code variant="block">{`function hello() {\n  return 'world';\n}`}</Code>
 */
export function Code({
    variant = 'inline',
    className,
    children,
}: CodeProps) {
    if (variant === 'block') {
        return (
            <pre className={cn(styles.block, className)}>
                <code>{children}</code>
            </pre>
        );
    }

    return (
        <code className={cn(styles.inline, className)}>
            {children}
        </code>
    );
}

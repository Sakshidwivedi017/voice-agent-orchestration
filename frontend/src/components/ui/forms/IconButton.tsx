import React from 'react';
import { cn } from '@/lib/cn';
import styles from './IconButton.module.css';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Accessible label for screen readers
     */
    'aria-label': string;

    /**
     * Button variant
     * @default 'primary'
     */
    variant?: 'primary' | 'secondary' | 'ghost';

    /**
     * Button size
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * Shape of the button
     * @default 'square'
     */
    shape?: 'square' | 'circle';

    /**
     * Loading state
     */
    loading?: boolean;

    /**
     * Content (usually an icon)
     */
    children: React.ReactNode;
}

/**
 * IconButton component for icon-only actions.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            shape = 'square',
            loading = false,
            'aria-label': ariaLabel,
            className,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                className={cn(
                    styles.iconButton,
                    styles[`variant-${variant}`],
                    styles[`size-${size}`],
                    styles[`shape-${shape}`],
                    loading && styles.loading,
                    className
                )}
                type={props.type || 'button'}
                aria-label={ariaLabel}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? <span className={styles.spinner} /> : children}
            </button>
        );
    }
);

IconButton.displayName = 'IconButton';

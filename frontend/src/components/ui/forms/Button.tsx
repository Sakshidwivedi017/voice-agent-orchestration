import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Button variant
     * @default 'primary'
     */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand' | 'subtle';

    /**
     * Button size
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * Loading state
     * @default false
     */
    loading?: boolean;

    /**
     * Icon to display on the left
     */
    leftIcon?: React.ReactNode;

    /**
     * Icon to display on the right
     */
    rightIcon?: React.ReactNode;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Full width
     * @default false
     */
    fullWidth?: boolean;

    /**
     * Content
     */
    children: React.ReactNode;

    /**
     * HTML element to render or React component
     * @default 'button'
     */
    as?: React.ElementType;

    /**
     * Allow any other props (e.g. href for Link)
     */
    [key: string]: any;
}

/**
 * Button component with variants, sizes, and loading state.
 * Supports polymorphic rendering via the 'as' prop.
 * 
 * @example
 * <Button variant="primary" size="lg" leftIcon={<Icon />}>
 *   Click me
 * </Button>
 * 
 * <Button as="a" href="/target" variant="brand">
 *   Link Button
 * </Button>
 */
export const Button = React.forwardRef<HTMLElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            fullWidth = false,
            leftIcon,
            rightIcon,
            className,
            disabled,
            children,
            as: Component = 'button',
            ...props
        },
        ref
    ) => {
        return (
            <Component
                ref={ref}
                className={cn(
                    styles.button,
                    styles[`variant-${variant}`],
                    styles[`size-${size}`],
                    loading && styles.loading,
                    fullWidth && styles.fullWidth,
                    className
                )}
                type={Component === 'button' ? (props.type || 'button') : undefined}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <span className={styles.spinner} />}
                {!loading && leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
                <span className={styles.content}>{children}</span>
                {!loading && rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
            </Component>
        );
    }
);

Button.displayName = 'Button';

import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Select.module.css';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    /**
     * Select size
     * @default 'md'
     */
    selectSize?: 'sm' | 'md' | 'lg';

    /**
     * Invalid state
     */
    invalid?: boolean;

    /**
     * Select options
     */
    options?: Array<{ label: string; value: string | number }>;
}

/**
 * Native Select component with design system styling.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            selectSize = 'md',
            invalid = false,
            options,
            className,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <div className={cn(styles.wrapper, styles[`size-${selectSize}`])}>
                <select
                    ref={ref}
                    className={cn(
                        styles.select,
                        invalid && styles.invalid,
                        disabled && styles.disabled,
                        className
                    )}
                    disabled={disabled}
                    {...props}
                >
                    {options ? (
                        options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))
                    ) : (
                        children
                    )}
                </select>
                <span className={styles.icon} aria-hidden="true">
                    ▼
                </span>
            </div>
        );
    }
);

Select.displayName = 'Select';

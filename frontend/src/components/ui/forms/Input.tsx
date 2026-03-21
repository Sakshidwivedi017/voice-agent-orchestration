import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * Input size
     * @default 'md'
     */
    inputSize?: 'sm' | 'md' | 'lg';

    /**
     * Invalid state
     * @default false
     */
    invalid?: boolean;

    /**
     * Element to display at the start of the input
     */
    startAdornment?: React.ReactNode;

    /**
     * Element to display at the end of the input
     */
    endAdornment?: React.ReactNode;
}

/**
 * Input component with sizes, states, and adornments.
 * 
 * @example
 * <Input inputSize="md" placeholder="Enter text" />
 * <Input startAdornment={<SearchIcon />} placeholder="Search..." />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            inputSize = 'md',
            invalid = false,
            startAdornment,
            endAdornment,
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        if (startAdornment || endAdornment) {
            return (
                <div
                    className={cn(
                        styles.wrapper,
                        styles[`size-${inputSize}`],
                        invalid && styles.invalid,
                        disabled && styles.disabled
                    )}
                >
                    {startAdornment && (
                        <span className={styles.startAdornment}>{startAdornment}</span>
                    )}
                    <input
                        ref={ref}
                        className={cn(styles.input, className)}
                        disabled={disabled}
                        {...props}
                    />
                    {endAdornment && (
                        <span className={styles.endAdornment}>{endAdornment}</span>
                    )}
                </div>
            );
        }

        return (
            <input
                ref={ref}
                className={cn(
                    styles.inputStandalone,
                    styles[`size-${inputSize}`],
                    invalid && styles.invalid,
                    disabled && styles.disabled,
                    className
                )}
                disabled={disabled}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';

import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Textarea.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /**
     * Textarea size
     * @default 'md'
     */
    textareaSize?: 'sm' | 'md' | 'lg';

    /**
     * Invalid state
     */
    invalid?: boolean;

    /**
     * Resize behavior
     * @default 'vertical'
     */
    resize?: 'none' | 'vertical' | 'both';
}

/**
 * Textarea component for multi-line text input.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            textareaSize = 'md',
            invalid = false,
            resize = 'vertical',
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    styles.textarea,
                    styles[`size-${textareaSize}`],
                    styles[`resize-${resize}`],
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

Textarea.displayName = 'Textarea';

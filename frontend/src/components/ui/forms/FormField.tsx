import React from 'react';
import { cn } from '@/lib/cn';
import { Label } from './Label';
import { HelperText } from './HelperText';
import { ErrorText } from './ErrorText';
import styles from './FormField.module.css';

export interface FormFieldProps {
    /**
     * Control ID (links label to control)
     */
    id: string;

    /**
     * Label content
     */
    label?: string;

    /**
     * Hint content
     */
    hint?: string;

    /**
     * Error message content
     */
    error?: string;

    /**
     * Required indicator
     */
    required?: boolean;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * The form control (Input, Select, etc.)
     */
    children: React.ReactNode;
}

/**
 * FormField wrapper that composes Label, Control, and feedback text.
 */
export function FormField({
    id,
    label,
    hint,
    error,
    required,
    className,
    children,
}: FormFieldProps) {
    return (
        <div className={cn(styles.formField, className)}>
            {label && (
                <Label htmlFor={id} required={required}>
                    {label}
                </Label>
            )}

            {children}

            {error ? (
                <ErrorText>{error}</ErrorText>
            ) : hint ? (
                <HelperText>{hint}</HelperText>
            ) : null}
        </div>
    );
}

import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Label.module.css';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    /**
     * Required indicator
     */
    required?: boolean;
}

/**
 * Label component for form field identifiers.
 */
export function Label({ required, className, children, ...props }: LabelProps) {
    return (
        <label className={cn(styles.label, className)} {...props}>
            {children}
            {required && <span className={styles.required} title="Required">*</span>}
        </label>
    );
}

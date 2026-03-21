'use client';

import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@/lib/cn';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
    /**
     * Checkbox ID
     */
    id: string;

    /**
     * Label content
     */
    label?: string;

    /**
     * Checked state (controlled)
     */
    checked?: boolean;

    /**
     * Default checked state
     */
    defaultChecked?: boolean;

    /**
     * Callback when state changes
     */
    onCheckedChange?: (checked: boolean) => void;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Disabled state
     */
    disabled?: boolean;
}

/**
 * Checkbox component using Radix Primitives for accessibility.
 */
export function Checkbox({
    id,
    label,
    checked,
    defaultChecked,
    onCheckedChange,
    className,
    disabled,
}: CheckboxProps) {
    return (
        <div className={cn(styles.wrapper, disabled && styles.disabled, className)}>
            <CheckboxPrimitive.Root
                id={id}
                className={styles.checkbox}
                checked={checked}
                defaultChecked={defaultChecked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
            >
                <CheckboxPrimitive.Indicator className={styles.indicator}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.icon}
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}
        </div>
    );
}

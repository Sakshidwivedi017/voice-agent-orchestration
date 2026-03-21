'use client';

import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/cn';
import styles from './Switch.module.css';

export interface SwitchProps {
    /**
     * Switch ID
     */
    id?: string;

    /**
     * Accessibility label
     */
    'aria-label'?: string;

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
 * Switch component for binary toggles.
 */
export function Switch({
    id,
    'aria-label': ariaLabel,
    checked,
    defaultChecked,
    onCheckedChange,
    className,
    disabled,
}: SwitchProps) {
    return (
        <SwitchPrimitive.Root
            id={id}
            className={cn(styles.switch, className)}
            checked={checked}
            defaultChecked={defaultChecked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            aria-label={ariaLabel}
        >
            <SwitchPrimitive.Thumb className={styles.thumb} />
        </SwitchPrimitive.Root>
    );
}

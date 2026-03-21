'use client';

import React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/cn';
import styles from './RadioGroup.module.css';

export interface RadioGroupProps {
    /**
     * Value of the selected radio (controlled)
     */
    value?: string;

    /**
     * Default selected value
     */
    defaultValue?: string;

    /**
     * Callback when value changes
     */
    onValueChange?: (value: string) => void;

    /**
     * Radio options
     */
    items: Array<{
        value: string;
        label: string;
        id: string;
        disabled?: boolean;
    }>;

    /**
     * Orientation
     * @default 'vertical'
     */
    orientation?: 'horizontal' | 'vertical';

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * RadioGroup component using Radix Primitives for accessibility.
 */
export function RadioGroup({
    value,
    defaultValue,
    onValueChange,
    items,
    orientation = 'vertical',
    className,
}: RadioGroupProps) {
    return (
        <RadioGroupPrimitive.Root
            className={cn(styles.root, styles[orientation], className)}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
        >
            {items.map((item) => (
                <div key={item.value} className={styles.itemWrapper}>
                    <RadioGroupPrimitive.Item
                        id={item.id}
                        value={item.value}
                        disabled={item.disabled}
                        className={styles.item}
                    >
                        <RadioGroupPrimitive.Indicator className={styles.indicator} />
                    </RadioGroupPrimitive.Item>
                    <label
                        htmlFor={item.id}
                        className={cn(styles.label, item.disabled && styles.disabledLabel)}
                    >
                        {item.label}
                    </label>
                </div>
            ))}
        </RadioGroupPrimitive.Root>
    );
}

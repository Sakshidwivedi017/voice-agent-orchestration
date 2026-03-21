'use client';

import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/cn';
import styles from './Tabs.module.css';

export interface TabsProps {
    /**
     * Default active tab value
     */
    defaultValue?: string;

    /**
     * Controlled active tab value
     */
    value?: string;

    /**
     * Callback when value changes
     */
    onValueChange?: (value: string) => void;

    /**
     * Tab items
     */
    items: Array<{
        value: string;
        label: string;
        content?: React.ReactNode;
    }>;

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * Tabs component using Radix primitives for keyboard navigation.
 * 
 * @example
 * <Tabs
 *   defaultValue="tab1"
 *   items={[
 *     { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
 *     { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div> }
 *   ]}
 * />
 */
export function Tabs({
    defaultValue,
    value,
    onValueChange,
    items,
    className,
}: TabsProps) {
    return (
        <TabsPrimitive.Root
            defaultValue={defaultValue}
            value={value}
            onValueChange={onValueChange}
            className={cn(className)}
        >
            <TabsPrimitive.List className={styles.list}>
                {items.map((item) => (
                    <TabsPrimitive.Trigger
                        key={item.value}
                        value={item.value}
                        className={styles.trigger}
                    >
                        {item.label}
                    </TabsPrimitive.Trigger>
                ))}
            </TabsPrimitive.List>

            {items.map((item) => (
                item.content && (
                    <TabsPrimitive.Content
                        key={item.value}
                        value={item.value}
                        className={styles.content}
                    >
                        {item.content}
                    </TabsPrimitive.Content>
                )
            ))}
        </TabsPrimitive.Root>
    );
}

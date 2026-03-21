'use client';

import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '@/lib/cn';
import styles from './Accordion.module.css';

export interface AccordionItem {
    value: string;
    title: string;
    content: React.ReactNode;
    disabled?: boolean;
}

export interface AccordionProps {
    /**
     * Accordion items
     */
    items: readonly AccordionItem[];

    /**
     * Type of interaction
     * @default 'single'
     */
    type?: 'single' | 'multiple';

    /**
     * Allow closing all items in single mode
     * @default true
     */
    collapsible?: boolean;

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * Accordion component for organized collapsible content.
 */
export function Accordion({
    items,
    type = 'single',
    collapsible = true,
    className,
}: AccordionProps) {
    return (
        <AccordionPrimitive.Root
            type={type as 'single' | 'multiple'}
            collapsible={collapsible}
            className={cn(styles.root, className)}
        >
            {items.map((item) => (
                <AccordionPrimitive.Item
                    key={item.value}
                    value={item.value}
                    disabled={item.disabled}
                    className={styles.item}
                >
                    <AccordionPrimitive.Header className={styles.header}>
                        <AccordionPrimitive.Trigger className={styles.trigger}>
                            {item.title}
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={styles.chevron}
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionPrimitive.Content className={styles.content}>
                        <div className={styles.contentInner}>
                            {item.content}
                        </div>
                    </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
            ))}
        </AccordionPrimitive.Root>
    );
}

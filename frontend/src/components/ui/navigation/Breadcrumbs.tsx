import React from 'react';
import NextLink from 'next/link';
import { cn } from '@/lib/cn';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface BreadcrumbsProps {
    /**
     * Breadcrumb items
     */
    items: BreadcrumbItem[];

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Separator element
     * @default '/'
     */
    separator?: React.ReactNode;
}

/**
 * Breadcrumbs component for secondary navigation and user path orientation.
 */
export function Breadcrumbs({
    items,
    className,
    separator = '/',
}: BreadcrumbsProps) {
    return (
        <nav className={cn(styles.breadcrumbs, className)} aria-label="Breadcrumb">
            <ol className={styles.list}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={item.label} className={styles.item}>
                            {!isLast && item.href ? (
                                <NextLink href={item.href} className={styles.link}>
                                    {item.label}
                                </NextLink>
                            ) : (
                                <span className={styles.current} aria-current="page">
                                    {item.label}
                                </span>
                            )}

                            {!isLast && (
                                <span className={styles.separator} aria-hidden="true">
                                    {separator}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

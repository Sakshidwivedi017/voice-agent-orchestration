import React from 'react';
import NextLink from 'next/link';
import { cn } from '@/lib/cn';
import styles from './Link.module.css';

export interface LinkProps {
    /**
     * Link destination
     */
    href: string;

    /**
     * Underline behavior
     * @default 'hover'
     */
    underline?: 'always' | 'hover' | 'never';

    /**
     * Link color tone
     * @default 'default'
     */
    tone?: 'default' | 'brand' | 'muted';

    /**
     * Whether this is an external link
     * Auto-detected if href starts with http/https
     */
    external?: boolean;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Content
     */
    children: React.ReactNode;
}

/**
 * Link component that wraps Next.js Link for internal navigation
 * and <a> for external links. Includes focus-visible styling.
 * 
 * @example
 * <Link href="/about">About Us</Link>
 * <Link href="https://example.com" external>External Site</Link>
 * <Link href="/contact" tone="brand" underline="always">Contact</Link>
 */
export function Link({
    href,
    underline = 'hover',
    tone = 'default',
    external: externalProp,
    className,
    children,
}: LinkProps) {
    // Auto-detect external links
    const isExternal = externalProp ?? (href.startsWith('http://') || href.startsWith('https://'));

    const linkClasses = cn(
        styles.link,
        styles[`underline-${underline}`],
        styles[`tone-${tone}`],
        className
    );

    if (isExternal) {
        return (
            <a
                href={href}
                className={linkClasses}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        );
    }

    return (
        <NextLink href={href} className={linkClasses}>
            {children}
        </NextLink>
    );
}

'use client';

import React from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import styles from './NavLink.module.css';

export interface NavLinkProps extends NextLinkProps {
    /**
     * Link label
     */
    children: React.ReactNode;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Active state override
     */
    isActive?: boolean;
}

/**
 * NavLink component that automatically sets active state based on current pathname.
 */
export function NavLink({
    href,
    children,
    className,
    isActive: isActiveProp,
    ...props
}: NavLinkProps) {
    const pathname = usePathname();
    const isActive = isActiveProp !== undefined
        ? isActiveProp
        : pathname === href || (typeof href === 'string' && href !== '/' && pathname?.startsWith(href));

    return (
        <NextLink
            href={href}
            className={cn(
                styles.navLink,
                isActive && styles.active,
                className
            )}
            aria-current={isActive ? 'page' : undefined}
            {...props}
        >
            {children}
        </NextLink>
    );
}

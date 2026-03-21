'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { NavLink } from './NavLink';
import styles from './MobileMenuContent.module.css';

interface MobileMenuContentProps {
    links: Array<{ label: string; href: string }>;
    actions?: React.ReactNode;
}

export function MobileMenuContent({ links, actions }: MobileMenuContentProps) {
    return (
        <div className={styles.content}>
            <div className={styles.logoArea}>
                <img className="logo-dark" src="/media/logo/imadgen-logo-dark.png" alt="IMADGEN" />
                <img className="logo-light" src="/media/logo/imadgen-logo-light.png" alt="IMADGEN" />
                <span>IMADGEN</span>
            </div>

            <nav className={styles.linksStack}>
                <DialogPrimitive.Close asChild>
                    <NavLink
                        href="/"
                        className={styles.navLink}
                    >
                        Home
                    </NavLink>
                </DialogPrimitive.Close>
                {links.map((link) => (
                    <DialogPrimitive.Close key={link.href} asChild>
                        <NavLink
                            href={link.href}
                            className={styles.navLink}
                        >
                            {link.label}
                        </NavLink>
                    </DialogPrimitive.Close>
                ))}
            </nav>

            {actions && (
                <div className={styles.actions}>
                    {actions}
                </div>
            )}
        </div>
    );
}

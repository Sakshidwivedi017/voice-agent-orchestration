import React from 'react';
import { Flex } from '../layout/Flex';
import { NavLink } from './NavLink';
import { MobileMenu } from './MobileMenu';
import { MobileMenuContent } from './MobileMenuContent';
import { IconButton } from '../forms/IconButton';
import { cn } from '@/lib/cn';
import styles from './Navbar.module.css';

export interface NavbarProps {
    brand: React.ReactNode;
    links: Array<{ label: string; href: string }>;
    actions?: React.ReactNode;
    className?: string;
    sticky?: boolean;
}

export function Navbar({
    brand,
    links,
    actions,
    className,
    sticky = true,
}: NavbarProps) {
    return (
        <header className={cn(styles.navbar, sticky && styles.sticky, className)}>
            <div className="wrap" style={{ width: '100%', height: '100%' }}>
                <Flex align="center" justify="between" className={styles.flex}>
                    <div className={styles.brand}>
                        {brand}
                    </div>

                    <nav className={styles.desktopNav}>
                        <Flex gap="24" align="center">
                            {links.map((link) => (
                                <NavLink key={link.href} href={link.href}>
                                    {link.label}
                                </NavLink>
                            ))}
                        </Flex>
                    </nav>

                    <div className={styles.rightSection}>
                        {actions && (
                            <div className={styles.actions}>
                                {actions}
                            </div>
                        )}

                        <div className={styles.mobileNav}>
                            <MobileMenu
                                trigger={
                                    <IconButton
                                        variant="ghost"
                                        aria-label="Toggle menu"
                                        className={styles.burger}
                                    >
                                        {/* Hamburger SVG icon */}
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect y="4" width="24" height="2" rx="1" fill="currentColor" />
                                            <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
                                            <rect y="18" width="24" height="2" rx="1" fill="currentColor" />
                                        </svg>
                                    </IconButton>
                                }
                            >
                                <MobileMenuContent links={links} actions={actions} />
                            </MobileMenu>
                        </div>
                    </div>
                </Flex>
            </div>
        </header>
    );
}

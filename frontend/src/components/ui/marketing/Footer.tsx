import React from 'react';
import { Container } from '../layout/Container';
import { Text } from '../typography/Text';
import styles from './Footer.module.css';

export interface FooterSocial {
    label: string;
    href: string;
    icon: React.ReactNode;
}

export interface FooterProps {
    /**
     * Site identifier (logo/name)
     */
    brand: React.ReactNode;

    /**
     * Brand name text
     */
    brandName?: string;

    /**
     * Primary copyright text
     */
    copyright: string;

    /**
     * Secondary message (e.g. "Built in India")
     */
    message?: string;

    /**
     * Social links
     */
    socials?: FooterSocial[];
}

/**
 * Footer component refactored to match production "finebar" style.
 */
export function Footer({
    brand,
    brandName,
    copyright,
    message,
    socials,
}: FooterProps) {
    return (
        <footer className={styles.footer}>
            <div className="wrap">
                <div className={styles.finebar}>
                    <div className={styles.fineLeft}>
                        <div>{copyright}</div>
                        {message && <div>{message}</div>}
                    </div>

                    <div className={styles.fineRight}>
                        {socials && (
                            <div className={styles.socials}>
                                {socials.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className={styles.iconBtn}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={social.label}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        )}

                        <div className={styles.footmark}>
                            <div className={styles.logo}>
                                {brand}
                            </div>
                            {brandName && <span className={styles.brandName}>{brandName}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

import React from 'react';
import { Flex } from '../layout/Flex';
import Image from 'next/image';
import styles from './LogoCloud.module.css';

export interface LogoCloudProps {
    /**
     * Section title
     */
    title?: string;

    /**
     * Array of logo elements or image props
     */
    logos: readonly {
        src: string;
        alt: string;
    }[];
}

/**
 * LogoCloud component for social proof and brand trust.
 */
export function LogoCloud({ title, logos }: LogoCloudProps) {
    return (
        <div className={styles.logoCloud}>
            {title && (
                <p className={styles.title}>
                    {title}
                </p>
            )}
            <Flex wrap="wrap" gap="32" justify="center" align="center">
                {logos.map((logo, index) => (
                    <div key={index} className={styles.logoWrapper}>
                        <Image
                            src={logo.src}
                            alt={logo.alt}
                            width={120}
                            height={40}
                            className={styles.logo}
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                ))}
            </Flex>
        </div>
    );
}

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/cn';
import styles from './ThemeImage.module.css';

export interface ThemeImageProps extends Omit<ImageProps, 'src' | 'alt'> {
    /**
     * Source for light theme
     */
    lightSrc: string;

    /**
     * Source for dark theme
     */
    darkSrc: string;

    /**
     * Alternate text
     */
    alt: string;

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * ThemeImage component that switches between two images based on the current theme.
 * Uses CSS to ensure no flash of un-themed content and zero layout shift.
 */
export function ThemeImage({
    lightSrc,
    darkSrc,
    alt,
    className,
    ...props
}: ThemeImageProps) {
    return (
        <>
            <Image
                {...props}
                src={darkSrc}
                alt={alt}
                className={cn(styles.darkOnly, className)}
            />
            <Image
                {...props}
                src={lightSrc}
                alt={alt}
                className={cn(styles.lightOnly, className)}
            />
        </>
    );
}

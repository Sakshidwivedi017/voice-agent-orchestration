import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Avatar.module.css';

export interface AvatarProps {
    /**
     * Image source URL
     */
    src?: string;

    /**
     * Accessibility alternative text
     */
    alt?: string;

    /**
     * Initials fallback
     */
    fallback: string;

    /**
     * Avatar size
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg' | 'xl';

    /**
     * Shape
     * @default 'circle'
     */
    shape?: 'circle' | 'square';

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * Avatar component for user profiles and identifiers.
 */
export function Avatar({
    src,
    alt,
    fallback,
    size = 'md',
    shape = 'circle',
    className,
}: AvatarProps) {
    const [error, setError] = React.useState(false);

    return (
        <div
            className={cn(
                styles.avatar,
                styles[`size-${size}`],
                styles[`shape-${shape}`],
                className
            )}
        >
            {src && !error ? (
                <img
                    src={src}
                    alt={alt}
                    className={styles.image}
                    onError={() => setError(true)}
                />
            ) : (
                <span className={styles.fallback}>{fallback}</span>
            )}
        </div>
    );
}

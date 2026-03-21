import React from 'react';
import { cn } from '@/lib/cn';
import { Stack } from '../layout/Stack';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
    /**
     * Icon or image element
     */
    icon?: React.ReactNode;

    /**
     * Main title
     */
    title: string;

    /**
     * Description text
     */
    description?: string;

    /**
     * Action element (button/link)
     */
    action?: React.ReactNode;

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * EmptyState component for cases with no data or results.
 */
export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn(styles.emptyState, className)}>
            <Stack gap="16" align="center">
                {icon && <div className={styles.icon}>{icon}</div>}
                <Stack gap="8" align="center">
                    <Heading as="h3" size="lg" align="center">
                        {title}
                    </Heading>
                    {description && (
                        <Text tone="muted" align="center" className={styles.description}>
                            {description}
                        </Text>
                    )}
                </Stack>
                {action && <div className={styles.action}>{action}</div>}
            </Stack>
        </div>
    );
}

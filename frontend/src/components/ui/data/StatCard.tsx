import React from 'react';
import { cn } from '@/lib/cn';
import { Surface } from '../layout/Surface';
import { Stack } from '../layout/Stack';
import { Text } from '../typography/Text';
import { Heading } from '../typography/Heading';
import styles from './StatCard.module.css';

export interface StatCardProps {
    /**
     * Label for the stat
     */
    label: string;

    /**
     * Main value to display
     */
    value: string | React.ReactNode;

    /**
     * Additional note or context
     */
    note?: string;

    /**
     * Color variant for status indication
     * @default 'neutral'
     */
    variant?: 'neutral' | 'success' | 'warning' | 'danger';

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * StatCard component for displaying key metrics and statistics.
 * 
 * @example
 * <StatCard 
 *   label="Answered by AI" 
 *   value="80-90%" 
 *   note="of routine calls"
 *   variant="success"
 * />
 */
export function StatCard({
    label,
    value,
    note,
    variant = 'neutral',
    className,
}: StatCardProps) {
    return (
        <Surface
            padding="lg"
            elevation="sm"
            radius="lg"
            className={cn(styles.statCard, styles[`variant-${variant}`], className)}
        >
            <Stack gap="8" align="center">
                <Text size="sm" tone="muted" className={styles.label}>
                    {label}
                </Text>
                <Heading as="h3" size="xl" className={styles.value}>
                    {value}
                </Heading>
                {note && (
                    <Text size="xs" tone="muted" className={styles.note}>
                        {note}
                    </Text>
                )}
            </Stack>
        </Surface>
    );
}

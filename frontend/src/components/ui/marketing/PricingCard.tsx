import React from 'react';
import { Surface } from '../layout/Surface';
import { Stack } from '../layout/Stack';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';
import { Divider } from '../layout/Divider';
import { Badge } from '../data/Badge';
import { cn } from '@/lib/cn';
import styles from './PricingCard.module.css';

export interface PricingCardProps {
    /**
     * Plan name
     */
    name: string;

    /**
     * Price string
     */
    price: string;

    /**
     * Frequency
     * @default '/mo'
     */
    frequency?: string;

    /**
     * Description
     */
    description?: string;

    /**
     * List of features
     */
    features: string[];

    /**
     * Action button
     */
    action: React.ReactNode;

    /**
     * Highlight this plan
     * @default false
     */
    featured?: boolean;
}

/**
 * PricingCard component for subscription plans comparison.
 */
export function PricingCard({
    name,
    price,
    frequency = '/mo',
    description,
    features,
    action,
    featured = false,
}: PricingCardProps) {
    return (
        <Surface
            padding="lg"
            elevation={featured ? 'lg' : 'sm'}
            className={cn(styles.card, featured && styles.featured)}
            radius="lg"
        >
            <Stack gap="32">
                <Stack gap="16">
                    <div className={styles.header}>
                        <Heading as="h3" size="lg">
                            {name}
                        </Heading>
                        {featured && (
                            <Badge variant="brand">Recommended</Badge>
                        )}
                    </div>

                    <div className={styles.priceContainer}>
                        <span className={styles.price}>{price}</span>
                        <span className={styles.frequency}>{frequency}</span>
                    </div>

                    {description && (
                        <Text size="sm" tone="muted">
                            {description}
                        </Text>
                    )}
                </Stack>

                <Divider />

                <Stack gap="12">
                    {features.map((feature, index) => (
                        <div key={index} className={styles.feature}>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={styles.check}
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <Text size="sm">{feature}</Text>
                        </div>
                    ))}
                </Stack>

                <div className={styles.action}>
                    {action}
                </div>
            </Stack>
        </Surface>
    );
}

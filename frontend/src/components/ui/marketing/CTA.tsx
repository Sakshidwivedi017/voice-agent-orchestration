import React from 'react';
import { Surface } from '../layout/Surface';
import { Stack } from '../layout/Stack';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';
import { cn } from '@/lib/cn';
import styles from './CTA.module.css';

export interface CTAProps {
    /**
     * Section title
     */
    title: string;

    /**
     * Description text
     */
    description?: string;

    /**
     * Action elements
     */
    actions: React.ReactNode;

    /**
     * Variant
     * @default 'brand'
     */
    variant?: 'brand' | 'surface';

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * CTA (Call to Action) component for conversion sections.
 */
export function CTA({
    title,
    description,
    actions,
    variant = 'brand',
    className,
}: CTAProps) {
    return (
        <Surface
            padding="lg"
            className={cn(styles.cta, styles[variant], className)}
            elevation="lg"
            radius="lg"
        >
            <Stack gap="32" align="center">
                <Stack gap="16" align="center">
                    <Heading as="h2" size="xl" align="center">
                        {title}
                    </Heading>
                    {description && (
                        <Text
                            size="lg"
                            align="center"
                            className={styles.description}
                        >
                            {description}
                        </Text>
                    )}
                </Stack>
                <div className={styles.actions}>
                    {actions}
                </div>
            </Stack>
        </Surface>
    );
}

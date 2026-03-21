import React from 'react';
import { Grid } from '../layout/Grid';
import { GridItem } from '../layout/GridItem';
import { Surface } from '../layout/Surface';
import { Stack } from '../layout/Stack';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';
import styles from './FeatureGrid.module.css';

export interface Feature {
    icon?: React.ReactNode;
    title: string;
    description: string;
}

export interface FeatureGridProps {
    /**
     * Feature items
     */
    features: Feature[];

    /**
     * Columns for desktop
     * @default 3
     */
    columns?: 1 | 2 | 3 | 4;
}

/**
 * FeatureGrid component for showcasing product benefits or features.
 */
export function FeatureGrid({
    features,
    columns = 3,
}: FeatureGridProps) {
    return (
        <Grid
            columns={{ base: 1, md: 2, lg: columns }}
            gap="24"
        >
            {features.map((feature, index) => (
                <GridItem key={index}>
                    <Surface padding="lg" elevation="sm" className={styles.card}>
                        <Stack gap="16">
                            {feature.icon && (
                                <div className={styles.icon}>
                                    {feature.icon}
                                </div>
                            )}
                            <Stack gap="8">
                                <Heading as="h3" size="md">
                                    {feature.title}
                                </Heading>
                                <Text tone="muted" size="sm">
                                    {feature.description}
                                </Text>
                            </Stack>
                        </Stack>
                    </Surface>
                </GridItem>
            ))}
        </Grid>
    );
}

import React from 'react';
import { Section } from '../layout/Section';
import { Container } from '../layout/Container';
import { Stack } from '../layout/Stack';
import { Heading, HeadingProps } from '../typography/Heading';
import { Text } from '../typography/Text';
import { cn } from '@/lib/cn';
import styles from './Hero.module.css';

export interface HeroProps {
    /**
     * Overline text/badge
     */
    badge?: React.ReactNode;

    /**
     * Main heading
     */
    title: React.ReactNode;

    /**
     * Font weight for the title
     */
    titleWeight?: HeadingProps['weight'];

    /**
     * Subtitle text
     */
    description: React.ReactNode;

    /**
     * Primary and secondary actions
     */
    actions?: React.ReactNode;

    /**
     * Visual element (image/video/canvas)
     */
    visual?: React.ReactNode;

    /**
     * Alignment
     * @default 'center'
     */
    align?: 'left' | 'center';

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * Hero component for high-impact landing sections.
 */
export function Hero({
    badge,
    title,
    titleWeight,
    description,
    actions,
    visual,
    align = 'center',
    className,
}: HeroProps) {
    return (
        <Section size="sm" className={cn(styles.hero, styles[align], className)}>
            <Container maxWidth="layout">
                <div className={styles.layout}>
                    <div className={styles.content}>
                        <Stack gap="24" align={align === 'center' ? 'center' : 'start'}>
                            {badge && <div className={styles.badge}>{badge}</div>}
                            <Heading as="h1" size="display" align={align} weight={titleWeight}>
                                {title}
                            </Heading>
                            <Text
                                size="lg"
                                tone="muted"
                                align={align}
                                className={styles.description}
                            >
                                {description}
                            </Text>
                            {actions && <div className={styles.actions}>{actions}</div>}
                        </Stack>
                    </div>

                    {visual && (
                        <div className={styles.visual}>
                            {visual}
                        </div>
                    )}
                </div>
            </Container>
        </Section>
    );
}

import React from 'react';
import { Surface } from '../layout/Surface';
import { Stack } from '../layout/Stack';
import { Text } from '../typography/Text';
import { Avatar } from '../data/Avatar';
import styles from './Testimonial.module.css';

export interface TestimonialProps {
    /**
     * Quote text
     */
    quote: string;

    /**
     * Author name
     */
    author: string;

    /**
     * Author role/title
     */
    role?: string;

    /**
     * Author avatar source
     */
    avatarSrc?: string;
}

/**
 * Testimonial component for customer reviews and testimonials.
 */
export function Testimonial({
    quote,
    author,
    role,
    avatarSrc,
}: TestimonialProps) {
    return (
        <Surface padding="lg" elevation="sm" className={styles.card}>
            <Stack gap="24">
                <Text size="lg" className={styles.quote}>
                    “{quote}”
                </Text>
                <div className={styles.footer}>
                    <Avatar
                        src={avatarSrc}
                        fallback={author.charAt(0)}
                        size="md"
                    />
                    <Stack gap="0">
                        <Text weight="semibold" size="sm">
                            {author}
                        </Text>
                        {role && (
                            <Text size="xs" tone="muted">
                                {role}
                            </Text>
                        )}
                    </Stack>
                </div>
            </Stack>
        </Surface>
    );
}

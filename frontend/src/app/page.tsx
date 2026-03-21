'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'
import { cn } from '@/lib/cn'
import { ChatProvider, useChatContext } from '@/components/ui/chatbox/ChatContext'

const brands = [
    { id: 'kfc', file: 'kfc.png' },
    { id: 'enamor', file: 'enamor.png' },
    { id: 'malaysia', file: 'malaysiana.png' },
    { id: 'bata', file: 'bata.png' },
    { id: 'hero', file: 'hero.png' },
    { id: 'lg', file: 'lg.png' },
    { id: 'panasonic', file: 'panasonic.png' },
    { id: 'itc', file: 'itc.png' },
    { id: 'indigo', file: 'indigo.png' },
    { id: 'sleepwell', file: 'sleepwell.png' },
    { id: 'mankind', file: 'mankind.png' },
    { id: 'nestle', file: 'nestle.png' },
    { id: 'oyo', file: 'oyo.png' },
    { id: 'zeiss', file: 'zeiss.png' },
    { id: 'radico', file: 'radico.png' },
    { id: 'dunkin', file: 'dunkin.png' },
]

import NetBGE from '@/components/effects/NetBGE'
import { Hero } from '@/components/ui/marketing/Hero'
import { Button } from '@/components/ui/forms/Button'
import { Section } from '@/components/ui/layout/Section'
import { Container } from '@/components/ui/layout/Container'
import { Grid } from '@/components/ui/layout/Grid'
import { Surface } from '@/components/ui/layout/Surface'
import { Heading } from '@/components/ui/typography/Heading'
import { Text } from '@/components/ui/typography/Text'
import { Stack } from '@/components/ui/layout/Stack'
import { Cluster } from '@/components/ui/layout/Cluster'
import { Input } from '@/components/ui/forms/Input'
import { Textarea } from '@/components/ui/forms/Textarea'
import { FormField } from '@/components/ui/forms/FormField'
import { ChatPage, Message } from '@/components/ui/chatbox/ChatPage'
import { Flex } from '@/components/ui/layout/Flex'

export default function Home() {
    return (
        <ChatProvider>
            <HomeContent />
        </ChatProvider>
    );
}

function HomeContent() {
    // Clocks Logic
    const [cities, setCities] = useState([
        { name: 'New York', tz: 'America/New_York', time: '--:--', h: 0, m: 0, s: 0 },
        { name: 'London', tz: 'Europe/London', time: '--:--', h: 0, m: 0, s: 0 },
        { name: 'Paris', tz: 'Europe/Paris', time: '--:--', h: 0, m: 0, s: 0 },
        { name: 'New Delhi', tz: 'Asia/Kolkata', time: '--:--', h: 0, m: 0, s: 0 },
        { name: 'Dubai', tz: 'Asia/Dubai', time: '--:--', h: 0, m: 0, s: 0 },
    ])

    const { isChatActive, setIsChatActive } = useChatContext();

    useEffect(() => {
        const tick = () => {
            setCities(current => current.map(c => {
                const now = new Date()
                const parts = new Intl.DateTimeFormat('en-US', {
                    timeZone: c.tz,
                    hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
                }).formatToParts(now)
                const get = (t: string) => Number(parts.find(p => p.type === t)?.value || 0)
                const h = get('hour')
                const m = get('minute')
                const s = get('second')

                const timeStr = new Intl.DateTimeFormat('en-US', {
                    timeZone: c.tz, hour: 'numeric', minute: '2-digit', hour12: true
                }).format(now)

                const hour12 = (h % 12) + (m / 60)
                return {
                    ...c,
                    time: timeStr,
                    h: (hour12 * 30) - 90,
                    m: ((m + s / 60) * 6) - 90,
                    s: (s * 6) - 90
                }
            }))
        }
        tick()
        const i = setInterval(tick, 1000)
        return () => clearInterval(i)
    }, [])

    return (
        <main className={cn(styles.main, isChatActive && styles.chatMode)}>
            <NetBGE />

            <div className={cn(styles.pageContent, isChatActive && styles.contentHidden)}>
                <Hero
                    title="The future, uncoded."
                    description="IMADGEN AI-native systems and tailored services that are adaptive to your business. From brand output to business operations, we ship practical intelligence that compounds."
                    actions={
                        <Button variant="primary" as="a" href="#verticals" size="lg">
                            Explore
                        </Button>
                    }
                    titleWeight="light"
                />

                <Section id="chat-interaction" className="py-24">
                    <Container>
                        <Flex justify="center" direction="column" className="w-full">
                            <ChatPage
                                variant="minimal"
                                placeholder="What would you like to build today?"
                            />
                        </Flex>
                    </Container>
                </Section>

                <Section id="verticals">
                    <Container>
                        <Stack gap="24" align="center" className={styles.sectionHead}>
                            <Heading as="h2" weight="light" align="center" className={`${styles.h2Underlined} underline-effect`}>
                                Verticals
                            </Heading>
                            <Text tone="muted" size="sm" align="center" className={styles.hint}>
                                Click into a vertical to explore modules, workflows, and what a deployment looks like.
                            </Text>
                        </Stack>

                        <Grid columns={{ base: 1, md: 3 }} gap="24">
                            <Surface as={Link} href="/studio" padding="lg" elevation="sm" radius="lg" className={styles.card} aria-label="AI Creative Studio">
                                <Heading as="h3" size="md" weight="light" className={styles.cardTitle}>AI Creative Studio</Heading>
                            </Surface>

                            <Surface as={Link} href="/os" padding="lg" elevation="sm" radius="lg" className={styles.card} aria-label="Marketing OS">
                                <Heading as="h3" size="md" weight="light" className={styles.cardTitle}>Marketing OS</Heading>
                            </Surface>

                            <Surface as={Link} href="/agents" padding="lg" elevation="sm" radius="lg" className={styles.card} aria-label="AI Agents">
                                <Heading as="h3" size="md" weight="light" className={styles.cardTitle}>AI Agents</Heading>
                            </Surface>
                        </Grid>

                        <div className={styles.brandsWrap} aria-label="Brands our team has worked with">
                            <div className={styles.brandsTitle}>Brands our team has worked with</div>

                            <div className={styles.brandsStrip}>
                                <div className={styles.brandsInner}>
                                    {[...brands, ...brands].map((brand, i) => (
                                        <Image
                                            key={i}
                                            src={`/media/brands/${brand.file}`}
                                            alt={brand.id}
                                            width={100}
                                            height={30}
                                            className={`${styles.brandLogo} ${styles[`is${brand.id.charAt(0).toUpperCase() + brand.id.slice(1)}`]} `}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    ))}
                                </div>
                                <div className={styles.brandsFade} aria-hidden="true"></div>
                            </div>
                        </div>
                    </Container>
                </Section>

                <Section id="contact">
                    <Container>
                        <Grid columns={{ base: 1, md: 2 }} gap="48" align="center">
                            <Stack gap="16">
                                <Heading as="h2" size="xl" weight="light">
                                    Tell us what you’re<br />trying to scale
                                </Heading>
                                <Text tone="muted">
                                    Drop your problem statement. We’ll get back to you.
                                </Text>
                            </Stack>

                            <form className={styles.contactForm}>
                                <Stack gap="24">
                                    <Textarea
                                        name="problem"
                                        placeholder="What are you trying to solve?"
                                        required
                                        rows={4}
                                    />
                                    <Grid columns={{ base: 1, md: 2 }} gap="16">
                                        <Input
                                            type="text"
                                            name="name"
                                            placeholder="Your name"
                                            required
                                        />
                                        <Input
                                            type="email"
                                            name="email"
                                            placeholder="Your email"
                                            required
                                        />
                                    </Grid>
                                    <div className={styles.contactActions}>
                                        <Button variant="primary" type="submit">
                                            Submit
                                        </Button>
                                    </div>
                                </Stack>
                            </form>
                        </Grid>

                        <div className={styles.dividerGlow} aria-hidden="true"></div>

                        <Grid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} gap="24" className={styles.clocksGrid}>
                            {cities.map(c => (
                                <Surface key={c.name} padding="md" elevation="sm" radius="lg" className={styles.clockCard}>
                                    <div className={styles.clockFace}>
                                        <div className={styles.clockNum} style={{ left: '50%', top: '14%' }}>12</div>
                                        <div className={styles.clockNum} style={{ left: '86%', top: '50%' }}>3</div>
                                        <div className={styles.clockNum} style={{ left: '50%', top: '86%' }}>6</div>
                                        <div className={styles.clockNum} style={{ left: '14%', top: '50%' }}>9</div>

                                        <div className={`${styles.hand} ${styles.handHour}`} style={{ '--rot': `${c.h}deg` } as React.CSSProperties}></div>
                                        <div className={`${styles.hand} ${styles.handMin}`} style={{ '--rot': `${c.m}deg` } as React.CSSProperties}></div>
                                        <div className={`${styles.hand} ${styles.handSec}`} style={{ '--rot': `${c.s}deg` } as React.CSSProperties}></div>
                                        <div className={styles.pin}></div>
                                    </div>
                                    <Stack gap="4" align="center" className={styles.clockInfo}>
                                        <Text weight="medium" className={styles.city}>{c.name}</Text>
                                        <Text tone="muted" size="sm" className={styles.time}>{c.time}</Text>
                                    </Stack>
                                </Surface>
                            ))}
                        </Grid>
                    </Container>
                </Section>
            </div>

            {isChatActive && (
                <div className={styles.fullChatContainer}>
                    <ChatPage
                        onClose={() => setIsChatActive(false)}
                        isFullPage={true}
                    />
                </div>
            )}
        </main>
    )
}

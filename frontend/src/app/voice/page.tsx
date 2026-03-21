'use client';

import React from 'react';
import { Hero } from '@/components/ui/marketing/Hero';
import { Section } from '@/components/ui/layout/Section';
import { Container } from '@/components/ui/layout/Container';
import { Grid } from '@/components/ui/layout/Grid';
import { Surface } from '@/components/ui/layout/Surface';
import { Stack } from '@/components/ui/layout/Stack';
import { Cluster } from '@/components/ui/layout/Cluster';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { Button } from '@/components/ui/forms/Button';
import { Badge } from '@/components/ui/data/Badge';
import { StatCard } from '@/components/ui/data/StatCard';
import WaveformBackground from '@/components/effects/WaveformBackground';
import { useScrollTrigger } from '@/lib/useScrollTrigger';
import styles from './page.module.css';

export default function VoicePage() {
    const [demoRef, isDemoVisible] = useScrollTrigger({ threshold: 0.3 });
    const [dashboardRef, isDashboardVisible] = useScrollTrigger({ threshold: 0.1 });
    const [chartRef, isChartVisible] = useScrollTrigger({ threshold: 0.1 });

    return (
        <main>
            <WaveformBackground />

            {/* SECTION 1: Hero */}
            <Hero
                title="Stop Missing Calls. Capture Every Reservation & Order"
                description={
                    <>
                        <strong>with 24/7 AI Voice Agents.</strong> Specifically designed for the unique demands of Restaurants and Hotels.
                        <br /><br />
                        Our Applied AI integrates seamlessly with your existing systems (POS/PMS) to manage calls, take reservations, and answer FAQs flawlessly. No staff training required.
                    </>
                }
                actions={
                    <Cluster gap="16" justify="center">
                        <Button variant="brand" size="lg">
                            📞 Book Your Free 15-Minute ROI Assessment
                        </Button>
                        <Button variant="ghost" size="lg">
                            See a Live Demo
                        </Button>
                    </Cluster>
                }
            />

            {/* SECTION 4: Live Demo/Sample Call */}
            <Section>
                <Container maxWidth="layout">
                    <Stack gap="48" align="center">
                        <Heading as="h2" size="xl" align="center">
                            See It In Action
                        </Heading>

                        <div ref={demoRef} className={`${styles.trendingSection} ${isDemoVisible ? styles.visible : ''}`}>
                            <Heading as="h3" size="md" className={styles.trendingTitle}>
                                Examples <span className={styles.chevron}>›</span>
                            </Heading>

                            <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="24">
                                {[
                                    { id: 'restaurant', name: 'Restaurant', pitch: 'Table reservations & takeout', brief: 'Handles peak-hour booking flows and answers menu-related FAQs.', avatar: '🍽️' },
                                    { id: 'service', name: 'Service Agent', pitch: 'Support & troubleshooting', brief: 'First-line support for common customer inquiries and technical issues.', avatar: '🛠️' },
                                    { id: 'clinic', name: 'Clinic', pitch: 'Appointment scheduling', brief: 'Manages patient bookings, follow-ups, and pre-visit instructions.', avatar: '🏥' },
                                    { id: 'sales', name: 'Sales Agent', pitch: 'Credit Card Acquisition', brief: 'Proactive engagement for product features, eligibility checks, and application starts.', avatar: '💳' },
                                    { id: 'helpline', name: 'Helpline', pitch: 'Govt Event Information', brief: 'Provides 24/7 public information about venue, schedule, and security for major events.', avatar: '🏛️' },
                                    { id: 'hotel', name: 'Hotel Front Desk', pitch: 'Bookings & Guest Services', brief: 'Assists with room reservations, late check-out requests, and local recommendations.', avatar: '🏨' },
                                ].map((voice) => (
                                    <div key={voice.id} className={styles.voiceCard}>
                                        <div className={styles.voiceAvatarWrapper}>
                                            <div className={styles.voiceAvatar}>{voice.avatar}</div>
                                        </div>
                                        <div className={styles.voiceInfo}>
                                            <Heading as="h4" size="sm" className={styles.voiceName}>
                                                {voice.name}
                                            </Heading>
                                            <Text size="xs" weight="medium" tone="brand">{voice.pitch}</Text>
                                            <div className={styles.voiceMeta}>
                                                <Text size="xs" tone="muted" className={styles.voiceBrief}>
                                                    {voice.brief}
                                                </Text>
                                            </div>

                                            {/* Audio Timeline Placeholder */}
                                            <div className={styles.timelineContainer}>
                                                <div className={styles.timelineTrack}>
                                                    <div className={styles.timelineProgress} />
                                                </div>
                                                <div className={styles.timelineTime}>0:00 / 0:30</div>
                                            </div>
                                        </div>
                                        <button className={styles.playButton} aria-label="Play sample">
                                            <div className={styles.playIcon} />
                                        </button>
                                    </div>
                                ))}
                            </Grid>
                        </div>
                    </Stack>
                </Container>
            </Section>

            {/* SECTION 2: Problem/Pain */}
            <Section>
                <Container maxWidth="layout">
                    <Stack gap="48" align="center">
                        <Heading as="h2" size="xl" align="center">
                            Are Missed Calls Costing You Revenue?
                        </Heading>

                        <Grid columns={{ base: 1, md: 2 }} gap="32">
                            <Surface padding="lg" elevation="md" radius="lg">
                                <Stack gap="24">
                                    <div className={styles.iconWrapper}>
                                        <span className={styles.icon}>🍽️</span>
                                    </div>
                                    <Heading as="h3" size="md">
                                        Restaurants
                                    </Heading>
                                    <Stack gap="12" as="ul" className={styles.bulletList}>
                                        <li>
                                            <Text>📉 Missed takeout orders during peak hours</Text>
                                        </li>
                                        <li>
                                            <Text>📅 Lost reservations from unanswered calls</Text>
                                        </li>
                                        <li>
                                            <Text>😓 Staff overwhelmed with repetitive FAQs</Text>
                                        </li>
                                    </Stack>
                                </Stack>
                            </Surface>

                            <Surface padding="lg" elevation="md" radius="lg">
                                <Stack gap="24">
                                    <div className={styles.iconWrapper}>
                                        <span className={styles.icon}>🏨</span>
                                    </div>
                                    <Heading as="h3" size="md">
                                        Hotels
                                    </Heading>
                                    <Stack gap="12" as="ul" className={styles.bulletList}>
                                        <li>
                                            <Text>🌙 Unanswered off-hours booking inquiries</Text>
                                        </li>
                                        <li>
                                            <Text>💼 Missed corporate client calls</Text>
                                        </li>
                                        <li>
                                            <Text>🔄 Endless FAQ calls about amenities</Text>
                                        </li>
                                    </Stack>
                                </Stack>
                            </Surface>
                        </Grid>
                    </Stack>
                </Container>
            </Section>

            {/* SECTION 3: Solution/Features */}
            <Section>
                <Container maxWidth="layout">
                    <Stack gap="48" align="center">
                        <Heading as="h2" size="xl" align="center">
                            What Your AI Agent Can Do (24/7/365)
                        </Heading>

                        <Grid columns={{ base: 1, md: 2 }} gap="32">
                            <Surface padding="lg" elevation="md" radius="lg" className={styles.featureCard}>
                                <Stack gap="16">
                                    <Heading as="h3" size="md" className={styles.featureTitle}>
                                        For Restaurants
                                    </Heading>
                                    <Stack gap="12" as="ul" className={styles.featureList}>
                                        <li>
                                            <Text>✅ Automated Reservations (calendar sync)</Text>
                                        </li>
                                        <li>
                                            <Text>🍕 Order Taking (POS integration)</Text>
                                        </li>
                                        <li>
                                            <Text>📋 Menu/Pricing/FAQ handling</Text>
                                        </li>
                                    </Stack>
                                </Stack>
                            </Surface>

                            <Surface padding="lg" elevation="md" radius="lg" className={styles.featureCard}>
                                <Stack gap="16">
                                    <Heading as="h3" size="md" className={styles.featureTitle}>
                                        For Hotels
                                    </Heading>
                                    <Stack gap="12" as="ul" className={styles.featureList}>
                                        <li>
                                            <Text>🏨 Instant Booking/Modification (PMS integration)</Text>
                                        </li>
                                        <li>
                                            <Text>🗺️ Guest Inquiries & Directions</Text>
                                        </li>
                                        <li>
                                            <Text>⬆️ Upselling (room upgrades, late check-outs)</Text>
                                        </li>
                                    </Stack>
                                </Stack>
                            </Surface>
                        </Grid>

                        <Grid columns={{ base: 1, md: 3 }} gap="24">
                            <StatCard
                                label="Answered by AI"
                                value="80-90%"
                                note="of routine calls"
                                variant="success"
                            />
                            <StatCard
                                label="Missed call recovery"
                                value="24/7"
                                note="no peak-hour drop offs"
                                variant="neutral"
                            />
                            <StatCard
                                label="Time saved"
                                value="3-5 hrs"
                                note="per staff per day"
                                variant="success"
                            />
                        </Grid>

                        <Cluster gap="12" justify="center">
                            <Badge variant="brand">Multilingual (EN + local languages)</Badge>
                            <Badge variant="success">Smart escalation to human staff</Badge>
                            <Badge variant="neutral">Fully custom prompts & persona</Badge>
                        </Cluster>

                        <Button variant="brand" size="lg">
                            Talk to us about Voice Agents
                        </Button>
                    </Stack>
                </Container>
            </Section>

            {/* SECTION 5: Tech/Credibility */}
            <Section>
                <Container maxWidth="layout">
                    <Stack gap="48" align="center">
                        <Stack gap="16" align="center">
                            <Heading as="h2" size="xl" align="center">
                                Behind the Voice: Our High-Performance Tech Stack
                            </Heading>
                            <Text size="lg" tone="muted" align="center">
                                Our Applied AI gives you low latency, high accuracy, and seamless integration
                            </Text>
                        </Stack>

                        <Grid columns={{ base: 1, sm: 2, md: 4 }} gap="24">
                            <Surface padding="lg" elevation="sm" radius="lg" className={styles.techCard}>
                                <Stack gap="12" align="center">
                                    <div className={styles.techIcon}>🧠</div>
                                    <Heading as="h3" size="sm" align="center">
                                        Natural Language Processing
                                    </Heading>
                                    <Text size="sm" tone="muted" align="center">
                                        Advanced NLP for accurate intent detection
                                    </Text>
                                </Stack>
                            </Surface>

                            <Surface padding="lg" elevation="sm" radius="lg" className={styles.techCard}>
                                <Stack gap="12" align="center">
                                    <div className={styles.techIcon}>🔗</div>
                                    <Heading as="h3" size="sm" align="center">
                                        Deep CRM/POS/PMS Integration
                                    </Heading>
                                    <Text size="sm" tone="muted" align="center">
                                        API-powered connections to your systems
                                    </Text>
                                </Stack>
                            </Surface>

                            <Surface padding="lg" elevation="sm" radius="lg" className={styles.techCard}>
                                <Stack gap="12" align="center">
                                    <div className={styles.techIcon}>🎙️</div>
                                    <Heading as="h3" size="sm" align="center">
                                        Custom Voice/Tone
                                    </Heading>
                                    <Text size="sm" tone="muted" align="center">
                                        Brand-aligned voice personality
                                    </Text>
                                </Stack>
                            </Surface>

                            <Surface padding="lg" elevation="sm" radius="lg" className={styles.techCard}>
                                <Stack gap="12" align="center">
                                    <div className={styles.techIcon}>⚡</div>
                                    <Heading as="h3" size="sm" align="center">
                                        Sub-second Response
                                    </Heading>
                                    <Text size="sm" tone="muted" align="center">
                                        Lightning-fast conversational AI
                                    </Text>
                                </Stack>
                            </Surface>
                        </Grid>
                    </Stack>
                </Container>
            </Section>

            {/* SECTION 6: Social Proof/Results */}
            <Section>
                <Container maxWidth="layout">
                    <Stack gap="48" align="center">
                        <Heading as="h2" size="xl" align="center">
                            Results You Can Measure
                        </Heading>

                        <div className={styles.highlightStat}>
                            <Heading as="h3" size="display" className={styles.highlightValue}>
                                98%
                            </Heading>
                            <Text size="lg" tone="muted">
                                Reduced missed calls
                            </Text>
                        </div>

                        <Grid columns={{ base: 1, md: 2 }} gap="32">
                            <Surface padding="lg" elevation="md" radius="lg" className={styles.testimonial}>
                                <Stack gap="16">
                                    <Text size="lg" className={styles.quote}>
                                        "Our phone lines were chaos during lunch and dinner rush. Now the AI handles 90% of calls flawlessly. Game changer."
                                    </Text>
                                    <div>
                                        <Text weight="medium">— Restaurant Owner, NYC</Text>
                                        <Text size="sm" tone="muted">Fine Dining, 200+ covers/day</Text>
                                    </div>
                                </Stack>
                            </Surface>

                            <Surface padding="lg" elevation="md" radius="lg" className={styles.testimonial}>
                                <Stack gap="16">
                                    <Text size="lg" className={styles.quote}>
                                        "We capture bookings 24/7 now. No more lost revenue from after-hours inquiries. ROI was instant."
                                    </Text>
                                    <div>
                                        <Text weight="medium">— Hotel Manager, Dubai</Text>
                                        <Text size="sm" tone="muted">Boutique Hotel, 120 rooms</Text>
                                    </div>
                                </Stack>
                            </Surface>
                        </Grid>

                        <div ref={chartRef} className={styles.chartWrapper}>
                            <Surface padding="lg" elevation="sm" radius="lg">
                                <Stack gap="24">
                                    <Heading as="h3" size="md" align="center">
                                        Call Handling Improvement
                                    </Heading>
                                    <div className={styles.simpleChart}>
                                        <div className={styles.chartBars}>
                                            {[
                                                { label: 'Week 1', height: 45, value: '45%' },
                                                { label: 'Week 2', height: 62, value: '62%' },
                                                { label: 'Week 3', height: 78, value: '78%' },
                                                { label: 'Week 4', height: 88, value: '88%' },
                                                { label: 'Week 5', height: 94, value: '94%' },
                                                { label: 'Week 6', height: 98, value: '98%' },
                                            ].map((bar, i) => (
                                                <div key={i} className={styles.barWrapper}>
                                                    <div className={styles.barContainer}>
                                                        <div
                                                            className={`${styles.bar} ${isChartVisible ? styles.barAnimated : ''}`}
                                                            style={{ '--bar-height': `${bar.height}%`, '--bar-delay': `${i * 0.1}s` } as React.CSSProperties}
                                                        >
                                                            <span className={styles.barValue}>{bar.value}</span>
                                                        </div>
                                                    </div>
                                                    <Text size="xs" tone="muted" className={styles.barLabel}>
                                                        {bar.label}
                                                    </Text>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Stack>
                            </Surface>
                        </div>
                    </Stack>
                </Container>
            </Section>

            {/* SECTION 7: Dashboard Preview */}
            <Section>
                <Container maxWidth="layout">
                    <Stack gap="48" align="center">
                        <Stack gap="16" align="center">
                            <Heading as="h2" size="xl" align="center">
                                Track Every Call, Booking & Revenue Opportunity
                            </Heading>
                            <Text size="lg" tone="muted" align="center">
                                See how your AI front desk is performing—calls answered, bookings made, missed calls recovered
                            </Text>
                        </Stack>

                        <div ref={dashboardRef} className={styles.dashboardPreview}>
                            <Surface padding="xl" elevation="lg" radius="lg" className={styles.dashboard}>
                                <Stack gap="32">
                                    <Grid columns={{ base: 2, md: 4 }} gap="16">
                                        <div className={styles.kpiCard}>
                                            <Text size="xs" tone="muted" className={styles.kpiLabel}>
                                                Total Calls Handled
                                            </Text>
                                            <Heading as="h4" size="lg" className={styles.kpiValue}>
                                                4,120
                                            </Heading>
                                        </div>
                                        <div className={styles.kpiCard}>
                                            <Text size="xs" tone="muted" className={styles.kpiLabel}>
                                                Missed/Escalated
                                            </Text>
                                            <Heading as="h4" size="lg" className={styles.kpiValue}>
                                                98
                                            </Heading>
                                        </div>
                                        <div className={styles.kpiCard}>
                                            <Text size="xs" tone="muted" className={styles.kpiLabel}>
                                                Revenue Captured
                                            </Text>
                                            <Heading as="h4" size="lg" className={styles.kpiValueSuccess}>
                                                $18,450
                                            </Heading>
                                        </div>
                                        <div className={styles.kpiCard}>
                                            <Text size="xs" tone="muted" className={styles.kpiLabel}>
                                                AI Accuracy
                                            </Text>
                                            <Heading as="h4" size="lg" className={styles.kpiValueSuccess}>
                                                97.4%
                                            </Heading>
                                        </div>
                                    </Grid>

                                    <div className={styles.callVolumeChart}>
                                        <Text size="sm" weight="medium" className={styles.chartTitle}>
                                            Daily Call Volume
                                        </Text>
                                        <div className={styles.miniChart}>
                                            {[120, 145, 138, 162, 158, 171, 189, 195].map((height, i) => (
                                                <div key={i} className={styles.miniBarContainer}>
                                                    <div
                                                        className={`${styles.miniBar} ${isDashboardVisible ? styles.miniBarAnimated : ''}`}
                                                        style={{ '--mini-height': `${(height / 200) * 100}%`, '--mini-delay': `${i * 0.08}s` } as React.CSSProperties}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.recentCalls}>
                                        <Text size="sm" weight="medium" className={styles.sectionTitle}>
                                            Recent Calls
                                        </Text>
                                        <Stack gap="8">
                                            {[
                                                { time: '19:42', type: 'Booking', status: 'confirmed' },
                                                { time: '19:38', type: 'Inquiry', status: 'answered' },
                                                { time: '19:35', type: 'Modification', status: 'confirmed' },
                                            ].map((call, i) => (
                                                <div key={i} className={styles.callRow}>
                                                    <Text size="sm" tone="muted" className={styles.callTime}>
                                                        {call.time}
                                                    </Text>
                                                    <Text size="sm" className={styles.callType}>
                                                        {call.type}
                                                    </Text>
                                                    <Badge
                                                        variant={call.status === 'confirmed' ? 'success' : 'neutral'}
                                                        className={styles.callStatus}
                                                    >
                                                        {call.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </Stack>
                                    </div>
                                </Stack>
                            </Surface>
                        </div>
                    </Stack>
                </Container>
            </Section>

            {/* SECTION 8: Final CTA */}
            <Section>
                <Container maxWidth="md">
                    <Stack gap="32" align="center" className={styles.finalCTA}>
                        <Heading as="h2" size="xl" align="center">
                            Start Converting Calls into Revenue Today
                        </Heading>
                        <Text size="lg" tone="muted" align="center">
                            Simple setup fee + monthly management—fully custom to your business
                        </Text>
                        <Button variant="brand" size="lg" className={styles.ctaButton}>
                            📞 Book Your Free 15-Minute ROI Assessment
                        </Button>
                        <Text size="sm" tone="muted" align="center">
                            No commitment. See exactly how much revenue you're losing to missed calls.
                        </Text>
                        <Text size="md" tone="muted" align="center" className={styles.roiNote}>
                            Average Client ROI: <strong className={styles.roiHighlight}>4x within 90 days</strong>
                        </Text>
                    </Stack>
                </Container>
            </Section>
        </main>
    );
}

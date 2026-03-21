'use client'

import styles from './page.module.css'
import Image from 'next/image'
import EmbersBGE from '@/components/effects/EmbersBGE'

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
    { id: 'dunkin', file: 'dunkin.jpg' },
]

export default function About() {
    return (
        <main>
            <EmbersBGE />
            <section className={styles.hero}>
                <div className="wrap">
                    <div className={styles.card}>
                        <h1>We build systems that make execution inevitable.</h1>
                        <p className={styles.lede}>
                            IMADGEN is an AI-native studio. We turn strategy into software, and workflows into repeatable outcomes—
                            across marketing, operations, and customer experience. Not “AI content.” Not “automation theatre.”
                            Practical intelligence that compounds.
                        </p>

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
                    </div>
                </div>
            </section>

            <div className="wrap" style={{ marginBottom: '48px' }}>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.kicker}>THE PROBLEM WE CARE ABOUT</div>
                        <h2>Good ideas die in handoffs.</h2>
                        <p>
                            Most teams don’t lose to competition—they lose to friction: unclear ownership, scattered tools, and
                            workflows that don’t scale.
                            AI doesn’t solve this by generating more. It solves it by tightening the system.
                        </p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.kicker}>THE WAY WE BUILD</div>
                        <h2>Product layers, not projects.</h2>
                        <p>
                            We build vertical “worlds” that stand alone—but connect into a single stack:
                        </p>
                        <ul>
                            <li><b>AI Creative Studio</b> — cinematic output at operational speed</li>
                            <li><b>Marketing OS</b> — partner + workflow control plane</li>
                            <li><b>AI Agents</b> — specialist operators for repeatable business work</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.card} style={{ marginTop: '14px' }}>
                    <div className={styles.kicker}>CONTACT</div>
                    <h2>Want a quick walkthrough?</h2>
                    <p style={{ marginTop: '6px' }}>
                        Email <a href="mailto:hq@imadgen.ai" style={{ textDecoration: 'underline' }}>hq@imadgen.ai</a> and tell us what
                        you’re trying to scale.
                    </p>
                </div>
            </div>
        </main>
    )
}

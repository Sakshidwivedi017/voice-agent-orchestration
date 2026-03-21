'use client'

import { useState, useEffect, ReactNode, FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import EmbersBGE from '@/components/effects/EmbersBGE'
import { Button } from '@/components/ui/forms/Button'
import { Form, FormField } from '@/components/ui/forms/Form'
import { Stack } from '@/components/ui/layout/Stack'
import { Grid } from '@/components/ui/layout/Grid'
import { Heading } from '@/components/ui/typography/Heading'
import { Text } from '@/components/ui/typography/Text'

// Reusable Carousel Component
function Carousel({ children }: { children: ReactNode[] }) {
    const [current, setCurrent] = useState(0)
    const count = children.length

    const next = () => setCurrent((p) => (p + 1) % count)
    const prev = () => setCurrent((p) => (p - 1 + count) % count)
    const go = (i: number) => setCurrent(i)

    return (
        <div className={styles.carousel}>
            <div className={styles.carouselNav}>
                <button className={styles.cbtn} onClick={prev}>‹</button>
                <button className={styles.cbtn} onClick={next}>›</button>
            </div>
            <div className={styles.carouselTrack} style={{ transform: `translateX(-${current * 100}%)` }}>
                {children}
            </div>
            <div className={styles.carouselDots}>
                {children.map((_, i) => (
                    <div key={i} className={`${styles.dot} ${current === i ? styles.active : ''}`} onClick={() => go(i)}></div>
                ))}
            </div>
        </div>
    )
}

export default function Studio() {
    const [showreelOpen, setShowreelOpen] = useState(false)
    // Auto-open logi
    useEffect(() => {
        const t = setTimeout(() => setShowreelOpen(true), 120)
        return () => clearTimeout(t)
    }, [])

    const contactFormFields: FormField[] = [
        {
            type: 'textarea',
            name: 'problem',
            placeholder: 'What are you trying to solve?',
            required: true,
            rows: 4
        },
        {
            type: 'text',
            name: 'name',
            placeholder: 'Your name',
            required: true
        },
        {
            type: 'email',
            name: 'email',
            placeholder: 'Your email',
            required: true
        }
    ]

    const handleContactSubmit = (e: FormEvent<HTMLFormElement>, data: Record<string, FormDataEntryValue>) => {
        console.log('Form submitted:', data)
        // Add your form submission logic here
    }

    return (
        <main>
            <EmbersBGE />
            {/* SHOWREEL MODAL */}
            {showreelOpen && (
                <div className={styles.srModal} onClick={(e) => e.target === e.currentTarget && setShowreelOpen(false)}>
                    <div className={styles.srFrame}>
                        <div className={styles.srClose} onClick={() => setShowreelOpen(false)}>✕</div>
                        <iframe
                            src="https://player.vimeo.com/video/1151322683?autoplay=1&muted=0&loop=0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            title="IMADGEN Showreel"
                        ></iframe>
                        <div className={styles.srLabel}>PRESS ESC TO CLOSE</div>
                    </div>
                </div>
            )}

            <section className={styles.hero} id="top">
                <div className="wrap">
                    <div className={styles.heroTop}>
                        <div className={`${styles.h2Underlined} underline-effect underline-effect--wide`}>AI CREATIVE STUDIO</div>
                        <h1>Studio output, without the bottlenecks.</h1>
                        <p className={styles.sub}>
                            Premium outputs across static and motion - built to scale, with guardrails that keep quality consistent.
                            We don’t sell “AI”. We ship production you can run campaigns on.
                        </p>

                        <div className={styles.heroActions}>
                            <Button variant="primary" as="a" href="#capabilities">See capabilities</Button>
                            <Button variant="secondary" onClick={() => setShowreelOpen(true)}>
                                ▶ Showreel <span className={styles.dur}>1:35</span>
                            </Button>
                            <Button as="a" href="#contact">Request a sample pack</Button>
                        </div>
                    </div>

                    <div className={`${styles.studioKv} ${!showreelOpen ? styles.isVisible : ''}`}>
                        <Image src="/media/studio/studio-master-dark.png" alt="Showreel Cover" width={720} height={405} style={{ width: '100%', height: 'auto' }} />
                    </div>

                    <div className={styles.rtb}>
                        <div className={styles.rtbStrip} aria-label="Proof points">
                            <div className={styles.rtbItem}>
                                <b>3× faster</b>
                                <span>brief → campaign-ready assets</span>
                            </div>
                            <div className={styles.rtbItem}>
                                <b>60-70% reset</b>
                                <span>cost vs reshoots + vendor churn</span>
                            </div>
                            <div className={styles.rtbItem}>
                                <b>10+ variants</b>
                                <span>from one locked standard</span>
                            </div>
                            <div className={styles.rtbItem}>
                                <b>24h loops</b>
                                <span>iteration designed for speed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <div className="wrap">
                    <div className={styles.sectionHead}>
                        <div>
                            <h2 className={`${styles.h2Underlined} underline-effect underline-effect--wide`}>Capabilities</h2>
                            <div className={styles.hint}>
                                We don’t just “generate images.” We build a full stack of controls—from product identity to cinematic physics—so the output is usable, not just impressive.
                            </div>
                        </div>
                    </div>

                    <div className={styles.capGrid}>

                        {/* 1. IDENTITY (Carousel) */}
                        <article className={`${styles.cap} ${styles.capSplit}`}>
                            <div className={styles.capBody}>
                                <div className={styles.capCopy}>
                                    <div className={styles.capHead}>
                                        <div className={styles.capEyebrow}>Identity</div>
                                        <div className={styles.capTitle}>One character. Infinite contexts.</div>
                                        <div className={styles.capSub}>Maintain identity across campaigns, platforms, and time. This quietly kills most competitors.</div>
                                    </div>
                                </div>
                                <div className={styles.capVisuals}>
                                    <Carousel>
                                        <div className={`${styles.carouselSlide} ${styles.gridIdentity}`}>
                                            <div className={`${styles.tile} ${styles.t1}`}>
                                                <Image src="/media/consistency/02-blue-cafe.png" alt="Cafe" fill sizes="50vw" />
                                                <div className={styles.capline}><span>CAFÉ</span><span>LOOK 02</span></div>
                                            </div>
                                            <div className={`${styles.tile} ${styles.t2}`}>
                                                <Image src="/media/consistency/03-park-reading.png" alt="Park" fill sizes="50vw" />
                                                <div className={styles.capline}><span>PARK</span><span>LOOK 03</span></div>
                                            </div>
                                        </div>
                                        <div className={`${styles.carouselSlide} ${styles.gridIdentity}`}>
                                            <div className={`${styles.tile} ${styles.t3}`}>
                                                <Image src="/media/consistency/04-green-velvet.png" alt="Evening" fill sizes="50vw" />
                                                <div className={styles.capline}><span>EVENING</span><span>LOOK 04</span></div>
                                            </div>
                                            <div className={`${styles.tile} ${styles.t4}`}>
                                                <Image src="/media/consistency/01-knit-studio.png" alt="Studio" fill sizes="50vw" />
                                                <div className={styles.capline}><span>STUDIO</span><span>LOOK 01</span></div>
                                            </div>
                                        </div>
                                    </Carousel>
                                </div>
                            </div>
                        </article>

                        {/* 2. REALISM (Carousel + Alt + Realism Layout) */}
                        <article className={`${styles.cap} ${styles.capSplit} ${styles.capAlt} ${styles.capRealism}`}>
                            <div className={styles.capBody}>
                                <div className={styles.capCopy}>
                                    <div className={styles.capHead}>
                                        <div className={styles.capEyebrow}>Believability</div>
                                        <div className={styles.capTitle}>Realism across forms.</div>
                                        <div className={styles.capSub}>Humans, animals, materials - built to feel physically true (skin, fur, lensing, texture, light).</div>
                                    </div>
                                </div>
                                <div className={styles.capVisuals}>
                                    <Carousel>
                                        <div className={`${styles.carouselSlide} ${styles.gridRealism}`}>
                                            <div className={`${styles.tile} ${styles.t1}`} style={{ gridColumn: 'span 12' }}>
                                                <video src="/media/realism/human1.mp4" muted autoPlay loop playsInline suppressHydrationWarning style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}></video>
                                                <div className={styles.capline}><span>HUMAN</span><span>REALISM</span></div>
                                            </div>
                                        </div>
                                        <div className={`${styles.carouselSlide} ${styles.gridRealism}`}>
                                            <div className={`${styles.tile} ${styles.t2}`} style={{ gridColumn: 'span 12' }}>
                                                <video src="/media/realism/leopard-portrait.mp4" muted autoPlay loop playsInline suppressHydrationWarning style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}></video>
                                                <div className={styles.capline}><span>ANIMAL</span><span>DETAIL</span></div>
                                            </div>
                                        </div>
                                    </Carousel>
                                </div>
                            </div>
                        </article>

                        {/* 3. SCALE (Carousel + Scale Layout) */}
                        <article className={`${styles.cap} ${styles.capSplit} ${styles.capScale}`}>
                            <div className={styles.capBody}>
                                <div className={styles.capCopy}>
                                    <div className={styles.capHead}>
                                        <div className={styles.capEyebrow}>Scale</div>
                                        <div className={styles.capTitle}>Cinematic scale.</div>
                                        <div className={styles.capSub}>Shots that feel expensive, without production limits. Wide, establishing, atmosphere, motion.</div>
                                    </div>
                                </div>
                                <div className={styles.capVisuals}>
                                    <Carousel>
                                        <div className={`${styles.carouselSlide} ${styles.gridScale}`}>
                                            <div className={`${styles.tile} ${styles.t1}`} style={{ gridColumn: 'span 12' }}>
                                                <Image src="/media/cinematic/ski.png" alt="Ski" fill />
                                                <div className={styles.capline}><span>WIDE</span><span>ESTABLISHING</span></div>
                                            </div>
                                        </div>
                                        <div className={`${styles.carouselSlide} ${styles.gridScale}`}>
                                            <div className={`${styles.tile} ${styles.t2}`} style={{ gridColumn: 'span 12' }}>
                                                <Image src="/media/cinematic/viking.png" alt="Viking" fill />
                                                <div className={styles.capline}><span>CINEMATIC</span><span>CHARACTER</span></div>
                                            </div>
                                        </div>
                                    </Carousel>
                                </div>
                            </div>
                        </article>

                        {/* 4. INTEGRITY (No Carousel, just grid, Alt Layout) */}
                        <article className={`${styles.cap} ${styles.capSplit} ${styles.capAlt}`}>
                            <div className={styles.capBody}>
                                <div className={styles.capCopy}>
                                    <div className={styles.capHead}>
                                        <div className={styles.capEyebrow}>Brand integrity</div>
                                        <div className={styles.capTitle}>Formats, built for every surface.</div>
                                        <div className={styles.capSub}>Social (Reels/TikTok/Stories), performance (Meta/Google), e-comm (PDP + marketplaces), OOH. We design outputs per platform spec.</div>
                                    </div>
                                </div>
                                <div className={styles.capVisuals}>
                                    <div className={styles.mediaGrid}>
                                        <div className={styles.tile} style={{ gridColumn: 'span 12', minHeight: '320px' }}>
                                            <Image src="/media/studio/studioformat.png" alt="Formats" fill style={{ objectFit: 'cover' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>

                    </div>
                </div>
            </section>

            <section id="production-diff" className={styles.section}>
                <div className="wrap">
                    <div className={styles.sectionHead}>
                        <div>
                            <h2 className={`${styles.h2Underlined} underline-effect underline-effect--wide`}>What changes vs traditional</h2>
                            <div className={styles.hint}>Not “AI replaces people.” It removes operational drag so taste and judgment stay human-led.</div>
                        </div>
                    </div>
                    <div className={styles.diffGrid}>
                        <div className={styles.diffCard}>
                            <h3>CONSISTENCY</h3>
                            <p>A locked standard: character, lighting, grade, composition, and brand rules across formats and variants.</p>
                        </div>
                        <div className={styles.diffCard}>
                            <h3>CONTROL</h3>
                            <p>You approve a bar. We ship to that bar: no style drift, no surprises, no endless re-brief loops.</p>
                        </div>
                        <div className={styles.diffCard}>
                            <h3>THROUGHPUT</h3>
                            <p>From one approved idea to a campaign’s worth of deliverables, without multiplying timelines and vendors.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="just-imadgen" className={styles.section}>
                <div className="wrap">
                    <div className={styles.justGrid}>
                        <div className={styles.justMedia}>
                            <video src="/media/cinematic/car.mp4" muted autoPlay loop playsInline suppressHydrationWarning style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}></video>
                        </div>
                        <div className={styles.justCopy}>
                            <div>
                                <div style={{ fontSize: '12px', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '8px' }}>just</div>
                                <div className={styles.big}>IMADGEN</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="contact" className={styles.section}>
                <div className="wrap">
                    <div className={styles.sectionHead}>
                        <div>
                            <Heading as="h2" size="lg" weight="light" className={`${styles.h2Underlined} underline-effect underline-effect--wide`}>Tell us what you're trying to scale</Heading>
                            <Text tone="muted" className={styles.hint}>Drop your problem statement. We'll respond with a suggested approach.</Text>
                        </div>
                    </div>
                    <Form 
                        fields={contactFormFields}
                        onSubmit={handleContactSubmit}
                        submitLabel="Submit"
                        submitVariant="primary"
                    />
                </div>
            </section>

            <section id="faq" className={styles.section}>
                <div className="wrap">
                    <div className={styles.sectionHead}>
                        <div>
                            <h2 className={`${styles.h2Underlined} underline-effect underline-effect--wide`}>FAQs</h2>
                        </div>
                    </div>
                    <div className={styles.faq}>
                        <details>
                            <summary>
                                <div>What’s different from “prompting”?<div className={styles.mini}>We don’t sell prompts; we sell a standard + guardrails.</div></div>
                                <div className={styles.chev}></div>
                            </summary>
                            <div style={{ padding: '0 0 18px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                Prompt-only workflows break at scale: style drift, inconsistent details. We run controlled pipelines and QC so outputs are repeatable.
                            </div>
                        </details>
                        <details>
                            <summary>
                                <div>Do you replace human creatives?<div className={styles.mini}>No. We remove operational drag so humans do judgment-level work.</div></div>
                                <div className={styles.chev}></div>
                            </summary>
                            <div style={{ padding: '0 0 18px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                Creative direction is human-led. AI is an execution engine so the work stays premium.
                            </div>
                        </details>
                        <details>
                            <summary>
                                <div>What deliverables do you support?<div className={styles.mini}>Static + motion, plus systems to produce variants reliably.</div></div>
                                <div className={styles.chev}></div>
                            </summary>
                            <div style={{ padding: '0 0 18px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                Key visuals, social assets, short loops, bumpers, and “content factory” systems.
                            </div>
                        </details>
                        <details>
                            <summary>
                                <div>Is this suitable for large-format / OOH?<div className={styles.mini}>Yes-upscaling + finishing is part of the pipeline.</div></div>
                                <div className={styles.chev}></div>
                            </summary>
                            <div style={{ padding: '0 0 18px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                We routinely deliver assets suitable for large-format and OOH usage, with upscaling, color, and finishing
                                handled as part of production.
                            </div>
                        </details>
                        <details>
                            <summary>
                                <div>What about copyright and ethics?<div className={styles.mini}>No copyrighted source material you don’t own. No “in the style of” cloning.</div></div>
                                <div className={styles.chev}></div>
                            </summary>
                            <div style={{ padding: '0 0 18px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                We avoid copyrighted references that don’t belong to us or the client, and we design workflows that
                                prioritize consent, licensing, and brand-safe outputs.
                            </div>
                        </details>
                        <details>
                            <summary>
                                <div>Is using AI to make videos legal?<div className={styles.mini}>Yes, with the right rights, releases, and licensing approach.</div></div>
                                <div className={styles.chev}></div>
                            </summary>
                            <div style={{ padding: '0 0 18px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                We stay inside brand-safe and rights-safe boundaries: no unlicensed copyrighted source material, no
                                deceptive claims, and clear usage terms. For talent likeness, we require consent and appropriate releases.
                            </div>
                        </details><details>
                            <summary>
                                <div>So… how exactly do you make an AI film?<div className={styles.mini}>It’s production: concept, pre-pro, generation, edit, finish-repeatable.</div></div>
                                <div className={styles.chev}></div>
                            </summary>
                            <div style={{ padding: '0 0 18px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                We start with a creative standard (look, lighting, composition rules), generate controlled shots, then
                                finish with edit, grade, sound, and QC. The difference is we treat it like a pipeline, not one-off
                                prompting.
                            </div>
                        </details><details>
                            <summary>
                                <div>Can I create an AI version of myself?<div className={styles.mini}>Yes-if you own the rights to your likeness and provide consent.</div></div>
                                <div className={styles.chev}></div>
                            </summary>
                            <div style={{ padding: '0 0 18px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                We can create a consistent digital double for campaign use, with guardrails so identity stays stable
                                across contexts. We only do this with explicit consent and approved reference material.
                            </div>
                        </details><details>
                            <summary>
                                <div>How do you price an AI film or video?<div className={styles.mini}>Based on scope: frames, duration, complexity, and turnaround.</div></div>
                                <div className={styles.chev}></div>
                            </summary>
                            <div style={{ padding: '0 0 18px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                Pricing depends on creative complexity (characters, product accuracy, environments), number of
                                shots/variants, and speed. We can quote fixed packs (KV, social set, motion loops) or campaign retainers.
                            </div>
                        </details><details>
                            <summary>
                                <div>Can I go hybrid-shoot some, generate some?<div className={styles.mini}>Yes. Hybrid is often the most practical path.</div></div>
                                <div className={styles.chev}></div>
                            </summary>
                            <div style={{ padding: '0 0 18px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                We can integrate real footage and generated shots, match grade and lighting, and use AI where it saves the
                                most time/money-while keeping key moments grounded in real production when needed.
                            </div>
                        </details>

                    </div>
                </div>
            </section>
        </main >
    )
}

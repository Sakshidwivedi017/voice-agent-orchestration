'use client'

import { useState } from 'react'
import styles from './page.module.css'
import EmbersBGE from '@/components/effects/EmbersBGE'

export default function OS() {
    const [openModules, setOpenModules] = useState<Record<string, boolean>>({})

    const toggle = (id: string) => {
        setOpenModules(prev => ({ ...prev, [id]: !prev[id] }))
    }

    return (
        <main>
            <EmbersBGE />
            <section className={styles.hero}>
                <div className="wrap">
                    <h1>Marketing OS.</h1>
                    <p className={styles.sub}>
                        Systems over chaos. A control layer for vendors, briefs, budgets, timelines, performance, and
                        partners—so marketing runs like an operation, not a scramble.
                    </p>
                    <div className={styles.status}>
                        <div className="pill"><b>Core:</b> Partner Management</div>
                        <div className="pill"><b>Mode:</b> Always-on</div>
                        <div className="pill"><b>Output:</b> Clarity + Velocity</div>
                    </div>
                </div>
            </section>

            <div className="wrap">
                <section className={styles.modules} aria-label="OS modules">
                    <div className={`${styles.mod} ${openModules['vendor'] ? styles.open : ''}`}>
                        <div className={styles.k} onClick={() => toggle('vendor')}>
                            <div className={styles.top}>
                                <div className={styles.t}>Partner Management Agent</div>
                                <div className={styles.mini}>{openModules['vendor'] ? 'Click to close' : 'Click to expand'}</div>
                            </div>
                            <div className={styles.desc}>
                                One system for every agency, creator, vendor, and freelancer. Track scope, costs, and
                                delivery without spreadsheets multiplying.
                            </div>
                            <div className={styles.more}>
                                <div>
                                    Includes: onboarding, rate cards, SOW tracking, approvals, SLA alerts, and “what’s stuck” visibility in
                                    one place.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.mod} ${openModules['brief'] ? styles.open : ''}`}>
                        <div className={styles.k} onClick={() => toggle('brief')}>
                            <div className={styles.top}>
                                <div className={styles.t}>Briefing & Approvals</div>
                                <div className={styles.mini}>{openModules['brief'] ? 'Click to close' : 'Click to expand'}</div>
                            </div>
                            <div className={styles.desc}>
                                Briefs that don’t degrade across forwarding chains. Approvals that don’t require chasing.
                            </div>
                            <div className={styles.more}>
                                <div>
                                    Structured briefs, stakeholder roles, feedback windows, and single-source-of-truth links for every
                                    deliverable.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.mod} ${openModules['budget'] ? styles.open : ''}`}>
                        <div className={styles.k} onClick={() => toggle('budget')}>
                            <div className={styles.top}>
                                <div className={styles.t}>Budget & Cost Memory</div>
                                <div className={styles.mini}>{openModules['budget'] ? 'Click to close' : 'Click to expand'}</div>
                            </div>
                            <div className={styles.desc}>
                                Know what things should cost, before you pay for them twice.
                            </div>
                            <div className={styles.more}>
                                <div>
                                    Historical cost baselines, vendor comparisons, city-wise benchmarks, and anomaly flags.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.mod} ${openModules['dashboard'] ? styles.open : ''}`}>
                        <div className={styles.k} onClick={() => toggle('dashboard')}>
                            <div className={styles.top}>
                                <div className={styles.t}>Execution Dashboard</div>
                                <div className={styles.mini}>{openModules['dashboard'] ? 'Click to close' : 'Click to expand'}</div>
                            </div>
                            <div className={styles.desc}>
                                See the whole machine: what’s live, what’s late, what’s blocked—without meetings.
                            </div>
                            <div className={styles.more}>
                                <div>
                                    Timeline views, dependency tracking, live checklists, and “owner + next action” clarity.
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}

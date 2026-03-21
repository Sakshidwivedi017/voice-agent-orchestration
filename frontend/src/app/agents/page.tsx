'use client'

import { useState } from 'react'
import styles from './page.module.css'
import SwarmsBGE from '@/components/effects/SwarmsBGE'

const agents = [
    { k: 'sales', t: 'Lead Qualifier', p: 'Qualifies inbound leads, captures intent, routes to the right closer.', tags: ['Voice/Chat', 'CRM-ready'] },
    { k: 'support', t: 'Customer Support Tier-1', p: 'Resolves common issues and escalates with context—no dead-end automation.', tags: ['Human handoff', 'SLA'] },
    { k: 'ops', t: 'Vendor Follow-up Agent', p: 'Tracks deliverables, nudges, and confirmations without endless calls.', tags: ['Reminders', 'Proof capture'] },
    { k: 'growth', t: 'Retention Nudges', p: 'Personalised nudges that sound natural—timed to behaviour, not guesswork.', tags: ['Journeys', 'Triggers'] },
    { k: 'sales', t: 'Appointment Setter', p: 'Schedules, reschedules, and confirms—reducing no-shows automatically.', tags: ['Calendar', 'WhatsApp'] },
    { k: 'ops', t: 'Ops Checklist Agent', p: 'Turns SOPs into running checklists with ownership and audit trails.', tags: ['SOP', 'QA'] },
]

export default function Agents() {
    const [filter, setFilter] = useState('all')

    return (
        <main>
            <SwarmsBGE />

            <section className={styles.hero}>
                <div className="wrap">
                    <h1>AI Agents.</h1>
                    <div className={styles.sub}>
                        Specialised automations and agents for SMBs—designed to feel human, stay reliable, and remove repetitive work without breaking the business.
                    </div>

                    <div className={styles.filters}>
                        <div className={`${styles.f} ${filter === 'all' ? styles.on : ''}`} onClick={() => setFilter('all')}>All</div>
                        <div className={`${styles.f} ${filter === 'sales' ? styles.on : ''}`} onClick={() => setFilter('sales')}>Sales</div>
                        <div className={`${styles.f} ${filter === 'support' ? styles.on : ''}`} onClick={() => setFilter('support')}>Support</div>
                        <div className={`${styles.f} ${filter === 'ops' ? styles.on : ''}`} onClick={() => setFilter('ops')}>Ops</div>
                        <div className={`${styles.f} ${filter === 'growth' ? styles.on : ''}`} onClick={() => setFilter('growth')}>Growth</div>
                    </div>
                </div>
            </section>

            <div className="wrap">
                <div className={styles.grid}>
                    {agents.map((a, i) => (
                        (filter === 'all' || filter === a.k) && (
                            <div key={i} className={styles.card}>
                                <div className={styles.t}>{a.t}</div>
                                <div className={styles.p}>{a.p}</div>
                                <div className={styles.meta}>
                                    {a.tags.map((t, j) => (
                                        <div key={j} className={styles.tag}>{t}</div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </main>
    )
}

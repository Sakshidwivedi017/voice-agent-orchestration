'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/data/Badge';
import { useScrollTrigger } from '@/lib/useScrollTrigger';
import styles from './page.module.css';

/* ============================================
   MOCK DATA
   ============================================ */

const PERIODS = ['Today', '7D', '30D', '90D'] as const;
type Period = typeof PERIODS[number];

const KPI_DATA: Record<Period, Array<{ icon: string; label: string; value: string; delta: string; deltaUp: boolean; variant?: string }>> = {
    Today: [
        { icon: '📞', label: 'Total Calls', value: '318', delta: '+12%', deltaUp: true },
        { icon: '⏱️', label: 'Total Minutes', value: '2,840', delta: '+8%', deltaUp: true },
        { icon: '📊', label: 'Avg Duration', value: '8m 56s', delta: '-0.4m', deltaUp: false },
        { icon: '💰', label: 'Total Cost', value: '$47.20', delta: '+9%', deltaUp: false, variant: 'warning' },
        { icon: '🎙️', label: 'Recordings', value: '298', delta: '+11%', deltaUp: true },
        { icon: '🤖', label: 'Active Agents', value: '6', delta: 'unchanged', deltaUp: true, variant: 'brand' },
    ],
    '7D': [
        { icon: '📞', label: 'Total Calls', value: '2,104', delta: '+18%', deltaUp: true },
        { icon: '⏱️', label: 'Total Minutes', value: '19,382', delta: '+15%', deltaUp: true },
        { icon: '📊', label: 'Avg Duration', value: '9m 13s', delta: '+0.3m', deltaUp: true },
        { icon: '💰', label: 'Total Cost', value: '$318.75', delta: '+16%', deltaUp: false, variant: 'warning' },
        { icon: '🎙️', label: 'Recordings', value: '1,987', delta: '+19%', deltaUp: true },
        { icon: '🤖', label: 'Active Agents', value: '6', delta: '+1', deltaUp: true, variant: 'brand' },
    ],
    '30D': [
        { icon: '📞', label: 'Total Calls', value: '8,920', delta: '+24%', deltaUp: true },
        { icon: '⏱️', label: 'Total Minutes', value: '80,460', delta: '+20%', deltaUp: true },
        { icon: '📊', label: 'Avg Duration', value: '9m 01s', delta: '+0.8m', deltaUp: true },
        { icon: '💰', label: 'Total Cost', value: '$1,340.00', delta: '+22%', deltaUp: false, variant: 'warning' },
        { icon: '🎙️', label: 'Recordings', value: '8,410', delta: '+23%', deltaUp: true },
        { icon: '🤖', label: 'Active Agents', value: '6', delta: 'stable', deltaUp: true, variant: 'brand' },
    ],
    '90D': [
        { icon: '📞', label: 'Total Calls', value: '26,448', delta: '+31%', deltaUp: true },
        { icon: '⏱️', label: 'Total Minutes', value: '234,120', delta: '+28%', deltaUp: true },
        { icon: '📊', label: 'Avg Duration', value: '8m 52s', delta: '+1.1m', deltaUp: true },
        { icon: '💰', label: 'Total Cost', value: '$3,920.40', delta: '+27%', deltaUp: false, variant: 'warning' },
        { icon: '🎙️', label: 'Recordings', value: '24,860', delta: '+30%', deltaUp: true },
        { icon: '🤖', label: 'Active Agents', value: '6', delta: '+2 new', deltaUp: true, variant: 'brand' },
    ],
};

const CALL_VOLUME: Record<Period, Array<{ label: string; value: number }>> = {
    Today: [
        { label: '6am', value: 12 }, { label: '8am', value: 38 }, { label: '10am', value: 62 },
        { label: '12pm', value: 88 }, { label: '2pm', value: 74 }, { label: '4pm', value: 96 },
        { label: '6pm', value: 110 }, { label: '8pm', value: 85 }, { label: '10pm', value: 52 },
    ],
    '7D': [
        { label: 'Mon', value: 280 }, { label: 'Tue', value: 312 }, { label: 'Wed', value: 298 },
        { label: 'Thu', value: 340 }, { label: 'Fri', value: 318 }, { label: 'Sat', value: 210 },
        { label: 'Sun', value: 175 },
    ],
    '30D': [
        { label: 'W1', value: 1840 }, { label: 'W2', value: 2120 }, { label: 'W3', value: 2380 },
        { label: 'W4', value: 2580 },
    ],
    '90D': [
        { label: 'Jan', value: 7230 }, { label: 'Feb', value: 8450 }, { label: 'Mar', value: 8920 },
    ],
};

const LLM_USAGE: Record<Period, Array<{ model: string; tokens: string; cost: string; pct: number }>> = {
    Today: [
        { model: 'GPT-4o', tokens: '2.4M', cost: '$28.80', pct: 82 },
        { model: 'Gemini 1.5 Flash', tokens: '480K', cost: '$9.60', pct: 28 },
        { model: 'Claude 3 Haiku', tokens: '210K', cost: '$4.20', pct: 12 },
    ],
    '7D': [
        { model: 'GPT-4o', tokens: '16.8M', cost: '$201.60', pct: 82 },
        { model: 'Gemini 1.5 Flash', tokens: '3.36M', cost: '$67.20', pct: 33 },
        { model: 'Claude 3 Haiku', tokens: '1.47M', cost: '$29.40', pct: 14 },
    ],
    '30D': [
        { model: 'GPT-4o', tokens: '72M', cost: '$864.00', pct: 87 },
        { model: 'Gemini 1.5 Flash', tokens: '14.4M', cost: '$288.00', pct: 35 },
        { model: 'Claude 3 Haiku', tokens: '6.3M', cost: '$126.00', pct: 15 },
    ],
    '90D': [
        { model: 'GPT-4o', tokens: '208M', cost: '$2,496', pct: 87 },
        { model: 'Gemini 1.5 Flash', tokens: '41.6M', cost: '$832.00', pct: 34 },
        { model: 'Claude 3 Haiku', tokens: '18.2M', cost: '$364.00', pct: 15 },
    ],
};

const STT_USAGE: Record<Period, Array<{ provider: string; minutes: string; cost: string; pct: number }>> = {
    Today: [
        { provider: 'Deepgram Nova-2', minutes: '2,210', cost: '$22.10', pct: 78 },
        { provider: 'Whisper (OpenAI)', minutes: '630', cost: '$6.30', pct: 22 },
    ],
    '7D': [
        { provider: 'Deepgram Nova-2', minutes: '15,120', cost: '$151.20', pct: 78 },
        { provider: 'Whisper (OpenAI)', minutes: '4,260', cost: '$42.60', pct: 22 },
    ],
    '30D': [
        { provider: 'Deepgram Nova-2', minutes: '62,760', cost: '$627.60', pct: 78 },
        { provider: 'Whisper (OpenAI)', minutes: '17,700', cost: '$177.00', pct: 22 },
    ],
    '90D': [
        { provider: 'Deepgram Nova-2', minutes: '182,412', cost: '$1,824.12', pct: 78 },
        { provider: 'Whisper (OpenAI)', minutes: '51,708', cost: '$517.08', pct: 22 },
    ],
};

const TTS_USAGE: Record<Period, Array<{ provider: string; chars: string; cost: string; pct: number }>> = {
    Today: [
        { provider: 'ElevenLabs', chars: '1.8M', cost: '$18.00', pct: 72 },
        { provider: 'Google TTS', chars: '0.7M', cost: '$7.00', pct: 28 },
    ],
    '7D': [
        { provider: 'ElevenLabs', chars: '12.6M', cost: '$126.00', pct: 72 },
        { provider: 'Google TTS', chars: '4.9M', cost: '$49.00', pct: 28 },
    ],
    '30D': [
        { provider: 'ElevenLabs', chars: '54M', cost: '$540.00', pct: 72 },
        { provider: 'Google TTS', chars: '21M', cost: '$210.00', pct: 28 },
    ],
    '90D': [
        { provider: 'ElevenLabs', chars: '156.6M', cost: '$1,566', pct: 72 },
        { provider: 'Google TTS', chars: '60.9M', cost: '$609.00', pct: 28 },
    ],
};

const CALL_LOGS = [
    { id: 'vc-8821', time: '17:24', agent: '🍽️ Rosso', agentName: 'Rosso', duration: '6m 12s', llm: 'GPT-4o', status: 'completed', cost: '$0.14', recording: true },
    { id: 'vc-8820', time: '17:19', agent: '🏨 Grand', agentName: 'Grand Hotel', duration: '11m 40s', llm: 'GPT-4o', status: 'completed', cost: '$0.28', recording: true },
    { id: 'vc-8819', time: '17:11', agent: '🏥 MedOne', agentName: 'MedOne Clinic', duration: '4m 05s', llm: 'Gemini', status: 'escalated', cost: '$0.08', recording: true },
    { id: 'vc-8818', time: '16:58', agent: '💳 AcquiBot', agentName: 'AcquiBot', duration: '9m 32s', llm: 'GPT-4o', status: 'completed', cost: '$0.22', recording: true },
    { id: 'vc-8817', time: '16:44', agent: '🏛️ HelpDesk', agentName: 'HelpDesk Gov', duration: '2m 18s', llm: 'Gemini', status: 'dropped', cost: '$0.04', recording: false },
    { id: 'vc-8816', time: '16:30', agent: '🍽️ Rosso', agentName: 'Rosso', duration: '7m 55s', llm: 'Claude', status: 'completed', cost: '$0.16', recording: true },
    { id: 'vc-8815', time: '16:18', agent: '🏨 Grand', agentName: 'Grand Hotel', duration: '14m 20s', llm: 'GPT-4o', status: 'completed', cost: '$0.34', recording: true },
    { id: 'vc-8814', time: '15:59', agent: '🏥 MedOne', agentName: 'MedOne Clinic', duration: '5m 44s', llm: 'GPT-4o', status: 'escalated', cost: '$0.12', recording: true },
];

const STATUS_SPLIT = [
    { label: 'Completed', pct: 71, fill: 'fillGreen' },
    { label: 'Escalated to Human', pct: 18, fill: 'fillOrange' },
    { label: 'Dropped / No Answer', pct: 8, fill: 'fillRed' },
    { label: 'Voicemail', pct: 3, fill: 'fillBlue' },
];

const INFRA = [
    {
        icon: '🪣',
        name: 'GCS Bucket — Recordings',
        meta: 'Not configured yet',
        status: 'not-configured' as const,
    },
    {
        icon: '🗄️',
        name: 'Postgres DB — Call Logs',
        meta: 'Not configured yet',
        status: 'not-configured' as const,
    },
    {
        icon: '📡',
        name: 'Telephony (Twilio)',
        meta: '+1 (310) 555-0142 · Active',
        status: 'connected' as const,
    },
    {
        icon: '🔑',
        name: 'OpenAI API',
        meta: 'sk-...Xn2k · Key valid',
        status: 'connected' as const,
    },
    {
        icon: '🧬',
        name: 'Deepgram STT',
        meta: 'API key active · Nova-2',
        status: 'connected' as const,
    },
    {
        icon: '🔊',
        name: 'ElevenLabs TTS',
        meta: 'Quota: 62% used',
        status: 'pending' as const,
    },
];

/* ============================================
   SUBCOMPONENTS
   ============================================ */

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.sectionLabel}>
            <span className={styles.sectionLabelText}>{children}</span>
            <div className={styles.sectionLabelLine} />
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { variant: 'success' | 'warning' | 'danger' | 'neutral' | 'brand'; label: string }> = {
        completed: { variant: 'success', label: 'Completed' },
        escalated: { variant: 'warning', label: 'Escalated' },
        dropped: { variant: 'danger', label: 'Dropped' },
        voicemail: { variant: 'neutral', label: 'Voicemail' },
    };
    const cfg = map[status] ?? { variant: 'neutral', label: status };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

function InfraStatusBadge({ status }: { status: 'connected' | 'pending' | 'not-configured' }) {
    if (status === 'connected') return <span className={`${styles.infraStatusBadge} ${styles.infraStatusConnected}`}>Connected</span>;
    if (status === 'pending') return <span className={`${styles.infraStatusBadge} ${styles.infraStatusPending}`}>Quota Warn</span>;
    return <span className={`${styles.infraStatusBadge} ${styles.infraStatusNotConfigured}`}>Not Set</span>;
}

function InfraStatusDot({ status }: { status: 'connected' | 'pending' | 'not-configured' }) {
    if (status === 'connected') return <div className={`${styles.statusDot} ${styles.statusDotGreen}`} />;
    if (status === 'pending') return <div className={`${styles.statusDot} ${styles.statusDotYellow}`} />;
    return <div className={`${styles.statusDot} ${styles.statusDotGrey}`} />;
}

/* ============================================
   MAIN PAGE
   ============================================ */

export default function VoiceAdminPage() {
    const [period, setPeriod] = useState<Period>('7D');
    const [activeFilter, setActiveFilter] = useState('All');
    const [chartRef, isChartVisible] = useScrollTrigger({ threshold: 0.1 });
    const [statusRef, isStatusVisible] = useScrollTrigger({ threshold: 0.2 });

    const kpis = KPI_DATA[period];
    const volumeBars = CALL_VOLUME[period];
    const maxVolume = Math.max(...volumeBars.map(b => b.value));
    const llm = LLM_USAGE[period];
    const stt = STT_USAGE[period];
    const tts = TTS_USAGE[period];

    const filteredLogs = activeFilter === 'All'
        ? CALL_LOGS
        : CALL_LOGS.filter(l => l.status.toLowerCase() === activeFilter.toLowerCase());

    return (
        <main>
            <div className={styles.adminPage}>

                {/* ── HEADER ── */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.adminBadge}>
                            <div className={styles.adminBadgeDot} />
                            Internal Admin
                        </div>
                        <h1 className={styles.pageTitle}>Voice Agent Dashboard</h1>
                        <p className={styles.pageSubtitle}>Operational metrics, usage, cost & infrastructure overview</p>
                    </div>
                    <div className={styles.periodSelector}>
                        {PERIODS.map(p => (
                            <button
                                key={p}
                                className={`${styles.periodPill} ${period === p ? styles.periodPillActive : ''}`}
                                onClick={() => setPeriod(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── KPI CARDS ── */}
                <SectionLabel>Key Metrics · {period}</SectionLabel>
                <div className={styles.kpiGrid}>
                    {kpis.map((kpi, i) => (
                        <div key={i} className={styles.kpiCard}>
                            <div className={styles.kpiIconRow}>
                                <div className={styles.kpiIcon}>{kpi.icon}</div>
                                <span className={`${styles.delta} ${kpi.deltaUp ? styles.deltaUp : styles.deltaDown}`}>
                                    {kpi.deltaUp ? '↑' : '↓'} {kpi.delta}
                                </span>
                            </div>
                            <div className={styles.kpiLabel}>{kpi.label}</div>
                            <div
                                className={`${styles.kpiValue} ${kpi.variant === 'warning' ? styles.kpiValueWarning
                                        : kpi.variant === 'brand' ? styles.kpiValueBrand
                                            : styles.kpiValueSuccess}`}
                            >
                                {kpi.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── CHARTS ROW ── */}
                <SectionLabel>Call Volume & Status Split</SectionLabel>
                <div className={styles.chartsRow}>

                    {/* Bar Chart */}
                    <div className={styles.chartCard} ref={chartRef as React.RefObject<HTMLDivElement>}>
                        <div className={styles.chartTitle}>
                            <span>Call Volume — {period}</span>
                            <span className={styles.chartMeta}>
                                Peak: {Math.max(...volumeBars.map(b => b.value)).toLocaleString()}
                            </span>
                        </div>
                        <div className={styles.barChartWrap}>
                            {volumeBars.map((bar, i) => (
                                <div key={i} className={styles.barCol}>
                                    <div className={styles.barContainer}>
                                        <div
                                            className={`${styles.bar} ${isChartVisible ? styles.barAnimated : ''}`}
                                            style={{
                                                '--bar-height': `${Math.round((bar.value / maxVolume) * 100)}%`,
                                                '--bar-delay': `${i * 0.07}s`,
                                            } as React.CSSProperties}
                                        />
                                    </div>
                                    <span className={styles.barLabel}>{bar.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status split */}
                    <div className={styles.chartCard} ref={statusRef as React.RefObject<HTMLDivElement>}>
                        <div className={styles.chartTitle}>
                            <span>Call Outcomes</span>
                        </div>
                        <div className={styles.donutWrap}>
                            {STATUS_SPLIT.map((s, i) => (
                                <div key={i} className={styles.statusBar}>
                                    <div className={styles.statusBarHeader}>
                                        <span className={styles.statusBarLabel}>{s.label}</span>
                                        <span className={styles.statusBarValue}>{s.pct}%</span>
                                    </div>
                                    <div className={styles.statusBarTrack}>
                                        <div
                                            className={`${styles.statusBarFill} ${styles[s.fill as keyof typeof styles]} ${isStatusVisible ? styles.statusBarFillAnimated : ''}`}
                                            style={{ '--fill-width': `${s.pct}%` } as React.CSSProperties}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── LLM / STT / TTS USAGE ── */}
                <SectionLabel>AI Usage Breakdown — {period}</SectionLabel>
                <div className={styles.usageRow}>

                    {/* LLM */}
                    <div className={styles.usageCard}>
                        <div className={styles.usageCardTitle}>
                            <div className={styles.usageCardIcon}>🧠</div>
                            LLM Usage
                        </div>
                        <div className={styles.usageRow2}>
                            {llm.map((item, i) => (
                                <div key={i} className={styles.usageItem}>
                                    <div className={styles.usageItemHeader}>
                                        <span className={styles.usageItemName}>{item.model}</span>
                                        <span className={styles.usageItemCost}>{item.cost}</span>
                                    </div>
                                    <div className={styles.usageTrack}>
                                        <div className={styles.usageFill} style={{ '--usage-width': `${item.pct}%` } as React.CSSProperties} />
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--muted2)' }}>{item.tokens} tokens</span>
                                </div>
                            ))}
                        </div>
                        <hr className={styles.usageDivider} />
                        <div className={styles.usageTotal}>
                            <span className={styles.usageTotalLabel}>Total LLM Cost</span>
                            <span className={styles.usageTotalValue}>
                                {llm.reduce((a, b) => {
                                    const n = parseFloat(b.cost.replace(/[$,]/g, ''));
                                    return a + n;
                                }, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                        </div>
                    </div>

                    {/* STT */}
                    <div className={styles.usageCard}>
                        <div className={styles.usageCardTitle}>
                            <div className={styles.usageCardIcon}>🎙️</div>
                            Speech-to-Text (STT)
                        </div>
                        <div className={styles.usageRow2}>
                            {stt.map((item, i) => (
                                <div key={i} className={styles.usageItem}>
                                    <div className={styles.usageItemHeader}>
                                        <span className={styles.usageItemName}>{item.provider}</span>
                                        <span className={styles.usageItemCost}>{item.cost}</span>
                                    </div>
                                    <div className={styles.usageTrack}>
                                        <div className={styles.usageFill} style={{ '--usage-width': `${item.pct}%` } as React.CSSProperties} />
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--muted2)' }}>{item.minutes} min transcribed</span>
                                </div>
                            ))}
                        </div>
                        <hr className={styles.usageDivider} />
                        <div className={styles.usageTotal}>
                            <span className={styles.usageTotalLabel}>Total STT Cost</span>
                            <span className={styles.usageTotalValue}>
                                {stt.reduce((a, b) => a + parseFloat(b.cost.replace(/[$,]/g, '')), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                        </div>
                    </div>

                    {/* TTS */}
                    <div className={styles.usageCard}>
                        <div className={styles.usageCardTitle}>
                            <div className={styles.usageCardIcon}>🔊</div>
                            Text-to-Speech (TTS)
                        </div>
                        <div className={styles.usageRow2}>
                            {tts.map((item, i) => (
                                <div key={i} className={styles.usageItem}>
                                    <div className={styles.usageItemHeader}>
                                        <span className={styles.usageItemName}>{item.provider}</span>
                                        <span className={styles.usageItemCost}>{item.cost}</span>
                                    </div>
                                    <div className={styles.usageTrack}>
                                        <div className={styles.usageFill} style={{ '--usage-width': `${item.pct}%` } as React.CSSProperties} />
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--muted2)' }}>{item.chars} chars synthesized</span>
                                </div>
                            ))}
                        </div>
                        <hr className={styles.usageDivider} />
                        <div className={styles.usageTotal}>
                            <span className={styles.usageTotalLabel}>Total TTS Cost</span>
                            <span className={styles.usageTotalValue}>
                                {tts.reduce((a, b) => a + parseFloat(b.cost.replace(/[$,]/g, '')), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── CALL LOGS TABLE ── */}
                <SectionLabel>Recent Call Logs</SectionLabel>
                <div className={styles.tableSection}>
                    <div className={styles.tableSectionHeader}>
                        <span className={styles.tableSectionTitle}>
                            📋 Call Log
                            <Badge variant="neutral">{CALL_LOGS.length} entries</Badge>
                        </span>
                        <div className={styles.tableFilterRow}>
                            {['All', 'Completed', 'Escalated', 'Dropped'].map(f => (
                                <button
                                    key={f}
                                    className={`${styles.filterPill} ${activeFilter === f ? styles.filterPillActive : ''}`}
                                    onClick={() => setActiveFilter(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.tableWrap}>
                        <table className={styles.callTable}>
                            <thead>
                                <tr>
                                    <th>Call ID</th>
                                    <th>Time</th>
                                    <th>Agent</th>
                                    <th>Duration</th>
                                    <th>LLM</th>
                                    <th>Status</th>
                                    <th>Cost</th>
                                    <th>Recording</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td><span className={styles.callId}>{log.id}</span></td>
                                        <td>{log.time}</td>
                                        <td>
                                            <div className={styles.agentName}>
                                                <div className={styles.agentAvatar}>{log.agent.split(' ')[0]}</div>
                                                {log.agentName}
                                            </div>
                                        </td>
                                        <td>{log.duration}</td>
                                        <td>
                                            <Badge variant={log.llm === 'GPT-4o' ? 'brand' : log.llm === 'Gemini' ? 'success' : 'neutral'}>
                                                {log.llm}
                                            </Badge>
                                        </td>
                                        <td><StatusBadge status={log.status} /></td>
                                        <td style={{ color: 'var(--orange)', fontWeight: 500 }}>{log.cost}</td>
                                        <td>
                                            {log.recording ? (
                                                <span className={styles.recordingLink}>▶ Play</span>
                                            ) : (
                                                <span style={{ color: 'var(--muted2)', fontSize: 12 }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={styles.tableFooter}>
                        <span>Showing {filteredLogs.length} of {CALL_LOGS.length} calls · Page 1</span>
                        <div className={styles.tablePagination}>
                            <button className={styles.pageBtn}>‹</button>
                            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
                            <button className={styles.pageBtn}>2</button>
                            <button className={styles.pageBtn}>3</button>
                            <button className={styles.pageBtn}>›</button>
                        </div>
                    </div>
                </div>

                {/* ── RECORDINGS + INFRASTRUCTURE ── */}
                <SectionLabel>Storage & Infrastructure</SectionLabel>
                <div className={styles.bottomRow}>

                    {/* Recordings */}
                    <div className={styles.bottomCard}>
                        <div className={styles.bottomCardTitle}>🎙️ Recordings Overview</div>
                        <div className={styles.recordingStats}>
                            <div className={styles.recStat}>
                                <div className={styles.recStatLabel}>Total Recordings</div>
                                <div className={styles.recStatValue}>1,987</div>
                                <div className={styles.recStatNote}>This period</div>
                            </div>
                            <div className={styles.recStat}>
                                <div className={styles.recStatLabel}>Storage Used</div>
                                <div className={styles.recStatValue}>34.2 GB</div>
                                <div className={styles.recStatNote}>of 100 GB quota</div>
                            </div>
                            <div className={styles.recStat}>
                                <div className={styles.recStatLabel}>Avg File Size</div>
                                <div className={styles.recStatValue}>17.2 MB</div>
                                <div className={styles.recStatNote}>MP3 · 128kbps</div>
                            </div>
                            <div className={styles.recStat}>
                                <div className={styles.recStatLabel}>Retention Policy</div>
                                <div className={styles.recStatValue}>90 days</div>
                                <div className={styles.recStatNote}>Auto-delete after</div>
                            </div>
                        </div>
                        <div className={styles.storageBar}>
                            <div className={styles.storageBarLabel}>
                                <span>GCS Storage</span>
                                <span>34.2 GB / 100 GB</span>
                            </div>
                            <div className={styles.storageTrack}>
                                <div className={styles.storageFill} />
                            </div>
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <Badge variant="warning">GCS Bucket not configured — recordings stored locally</Badge>
                        </div>
                    </div>

                    {/* Infrastructure */}
                    <div className={styles.bottomCard}>
                        <div className={styles.bottomCardTitle}>🔧 Infrastructure Status</div>
                        <div className={styles.infraList}>
                            {INFRA.map((item, i) => (
                                <div key={i} className={styles.infraItem}>
                                    <div className={styles.infraIcon}>{item.icon}</div>
                                    <div className={styles.infraInfo}>
                                        <div className={styles.infraName}>{item.name}</div>
                                        <div className={styles.infraMeta}>{item.meta}</div>
                                    </div>
                                    <InfraStatusDot status={item.status} />
                                    <InfraStatusBadge status={item.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}

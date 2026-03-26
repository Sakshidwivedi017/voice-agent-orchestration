'use client';

import React, { useState, useCallback } from 'react';
import WaveformBackground from '@/components/effects/WaveformBackground';
import { Surface } from '@/components/ui/layout/Surface';
import { Stack } from '@/components/ui/layout/Stack';
import { Grid } from '@/components/ui/layout/Grid';
import { Container } from '@/components/ui/layout/Container';
import { Cluster } from '@/components/ui/layout/Cluster';
import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { Button } from '@/components/ui/forms/Button';
import { Select } from '@/components/ui/forms/Select';
import { Input } from '@/components/ui/forms/Input';
import { Textarea } from '@/components/ui/forms/Textarea';
import { Switch } from '@/components/ui/forms/Switch';
import { Badge } from '@/components/ui/data/Badge';
import { useToast } from '@/components/ui/overlays/Toast';
import styles from './page.module.css';

// ─── Data ─────────────────────────────────────────────────────────────────────
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const LLM_MODELS = [
    { label: 'GPT-4o (OpenAI)', value: 'gpt-4o' },
    { label: 'GPT-4o Mini (OpenAI)', value: 'gpt-4o-mini' },
    { label: 'GPT-3.5 Turbo (OpenAI)', value: 'gpt-3.5-turbo' },
    { label: 'Gemini 1.5 Pro (Google)', value: 'gemini-1.5-pro' },
    { label: 'Gemini 1.5 Flash (Google)', value: 'gemini-1.5-flash' },
    { label: 'Gemini 2.0 Flash (Google)', value: 'gemini-2.0-flash' },
    { label: 'Claude 3.5 Sonnet (Anthropic)', value: 'claude-3-5-sonnet' },
    { label: 'Claude 3 Haiku (Anthropic)', value: 'claude-3-haiku' },
    { label: 'Llama 3.1 70B (Meta / Groq)', value: 'llama-3.1-70b' },
];

const STT_MODELS = [
    { label: 'Deepgram Nova-2 (Recommended)', value: 'deepgram-nova-2' },
    { label: 'Deepgram Nova-2 Phone Call', value: 'deepgram-nova-2-phone' },
    { label: 'OpenAI Whisper-1', value: 'openai-whisper-1' },
    { label: 'ElevenLabs STT', value: 'elevenlabs-stt' },
    { label: 'Gemini Speech-to-Text', value: 'gemini-stt' },
    { label: 'AssemblyAI Universal', value: 'assemblyai-universal' },
];

const TTS_VOICES = [
    { label: 'Rachel — ElevenLabs (Warm, Professional)', value: 'el-rachel' },
    { label: 'Aria — ElevenLabs (Friendly, Clear)', value: 'el-aria' },
    { label: 'Drew — ElevenLabs (Confident, Deep)', value: 'el-drew' },
    { label: 'Clyde — ElevenLabs (Conversational)', value: 'el-clyde' },
    { label: 'Domi — ElevenLabs (Energetic)', value: 'el-domi' },
    { label: '─────────────────', value: '', disabled: true },
    { label: 'Asteria — Deepgram Aura (Calm, Clear)', value: 'dg-asteria' },
    { label: 'Luna — Deepgram Aura (Warm)', value: 'dg-luna' },
    { label: 'Orion — Deepgram Aura (Professional)', value: 'dg-orion' },
    { label: '─────────────────', value: '', disabled: true },
    { label: 'Wavenet-F (Google / Gemini)', value: 'gcp-wavenet-f' },
    { label: 'Neural2-C (Google / Gemini)', value: 'gcp-neural2-c' },
    { label: '─────────────────', value: '', disabled: true },
    { label: 'Sarvam Meera (Hindi/English)', value: 'sarvam-meera' },
    { label: 'Sarvam Arjun (Hindi/English)', value: 'sarvam-arjun' },
];

const FALLBACK_VOICES = [
    { label: 'OpenAI TTS-1 — Alloy (Default)', value: 'openai-alloy' },
    { label: 'OpenAI TTS-1 — Echo', value: 'openai-echo' },
    { label: 'OpenAI TTS-1 — Nova', value: 'openai-nova' },
    { label: 'OpenAI TTS-1 — Shimmer', value: 'openai-shimmer' },
    { label: 'OpenAI TTS-HD — Onyx', value: 'openai-onyx' },
];

const SAMPLE_CALL_LOGS = [
    { id: 'CL-0041', from: '+91 98765 43210', duration: '2m 14s', intent: 'Reservation', status: 'resolved', ts: 'Today 14:32' },
    { id: 'CL-0040', from: '+1 415 555 0192', duration: '0m 47s', intent: 'FAQ', status: 'resolved', ts: 'Today 13:18' },
    { id: 'CL-0039', from: '+44 7700 900891', duration: '1m 58s', intent: 'Escalation', status: 'escalated', ts: 'Today 11:05' },
    { id: 'CL-0038', from: '+91 80000 12345', duration: '3m 02s', intent: 'Order', status: 'resolved', ts: 'Yesterday 22:47' },
    { id: 'CL-0037', from: '+971 50 123 4567', duration: '0m 22s', intent: 'Hung up', status: 'dropped', ts: 'Yesterday 21:11' },
];

const SAMPLE_RECORDINGS = [
    { id: 'REC-0041', label: 'CL-0041 — +91 98765 43210', duration: '2:14', size: '1.8 MB', ts: 'Today 14:32' },
    { id: 'REC-0040', label: 'CL-0040 — +1 415 555 0192', duration: '0:47', size: '0.6 MB', ts: 'Today 13:18' },
    { id: 'REC-0039', label: 'CL-0039 — +44 7700 900891', duration: '1:58', size: '1.5 MB', ts: 'Today 11:05' },
];

const TABS = ['AI Models', 'Behaviour', 'Knowledge Base', 'Analytics', 'Compliance'] as const;
type Tab = (typeof TABS)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <div className={styles.sectionLabel}>{children}</div>;
}

function FieldRow({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={styles.fieldRow}>
            <div className={styles.fieldMeta}>
                <Text size="sm" weight="medium">{label}</Text>
                {hint && <Text size="xs" tone="muted">{hint}</Text>}
            </div>
            <div className={styles.fieldControl}>{children}</div>
        </div>
    );
}

function ToggleRow({
    label,
    hint,
    checked,
    onChange,
    id,
}: {
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    id: string;
}) {
    return (
        <div className={styles.toggleRow}>
            <div>
                <Text size="sm" weight="medium">{label}</Text>
                {hint && <Text size="xs" tone="muted">{hint}</Text>}
            </div>
            <Switch id={id} checked={checked} onCheckedChange={onChange} aria-label={label} />
        </div>
    );
}

// ─── Section Panels ───────────────────────────────────────────────────────────

function AiModelsPanel({
    llm, setLlm,
    stt, setStt,
    tts, setTts,
}: {
    llm: string; setLlm: (v: string) => void;
    stt: string; setStt: (v: string) => void;
    tts: string; setTts: (v: string) => void;
}) {
    return (
        <Stack gap="24">
            <SectionLabel>Language Model (LLM)</SectionLabel>
            <FieldRow
                label="LLM Provider & Model"
                hint="The brain of your agent — decides what to say and how to handle requests."
            >
                <Select
                    value={llm}
                    onChange={e => setLlm(e.target.value)}
                    options={LLM_MODELS}
                />
            </FieldRow>

            <div className={styles.divider} />

            <SectionLabel>Speech-to-Text (STT)</SectionLabel>
            <FieldRow
                label="Transcription Engine"
                hint="Converts the caller's voice to text in real time."
            >
                <Select
                    value={stt}
                    onChange={e => setStt(e.target.value)}
                    options={STT_MODELS}
                />
            </FieldRow>

            <div className={styles.divider} />

            <SectionLabel>Text-to-Speech (TTS) Voice</SectionLabel>
            <FieldRow
                label="Agent Voice"
                hint="Choose the voice persona your callers will hear."
            >
                <Select
                    value={tts}
                    onChange={e => setTts(e.target.value)}
                >
                    {TTS_VOICES.map((v, i) => (
                        <option key={i} value={v.value} disabled={v.disabled}>{v.label}</option>
                    ))}
                </Select>
            </FieldRow>

            <div className={styles.modelChips}>
                {[
                    { icon: '🧠', name: 'OpenAI', tag: 'LLM + Fallback TTS' },
                    { icon: '🎙️', name: 'ElevenLabs', tag: 'TTS + STT' },
                    { icon: '🔵', name: 'Google Gemini', tag: 'LLM + STT + TTS' },
                    { icon: '📡', name: 'Deepgram', tag: 'STT + TTS' },
                    { icon: '🤖', name: 'Anthropic', tag: 'LLM' },
                    { icon: '🌐', name: 'Sarvam', tag: 'TTS (Multilingual)' },
                ].map(p => (
                    <div key={p.name} className={styles.modelChip}>
                        <span className={styles.chipIcon}>{p.icon}</span>
                        <div>
                            <div className={styles.chipName}>{p.name}</div>
                            <div className={styles.chipTag}>{p.tag}</div>
                        </div>
                    </div>
                ))}
            </div>
        </Stack>
    );
}

function BehaviourPanel({
    firstMsg, setFirstMsg,
    prompt, setPrompt,
    transcribe, setTranscribe,
    fallbackVoice, setFallbackVoice,
    waitTime, setWaitTime,
}: {
    firstMsg: string; setFirstMsg: (v: string) => void;
    prompt: string; setPrompt: (v: string) => void;
    transcribe: boolean; setTranscribe: (v: boolean) => void;
    fallbackVoice: string; setFallbackVoice: (v: string) => void;
    waitTime: number; setWaitTime: (v: number) => void;
}) {
    return (
        <Stack gap="24">
            <SectionLabel>Agent Persona & Prompt</SectionLabel>

            <FieldRow
                label="First Message"
                hint="What the agent says when it picks up the call."
            >
                <Input
                    inputSize="md"
                    value={firstMsg}
                    onChange={e => setFirstMsg(e.target.value)}
                    placeholder="Hi, thank you for calling! How can I help you today?"
                />
            </FieldRow>

            <FieldRow
                label="System Prompt"
                hint="Define the agent's role, tone, knowledge, and guardrails."
            >
                <Textarea
                    textareaSize="md"
                    resize="vertical"
                    rows={6}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={`You are a friendly and professional front-desk assistant for [Business Name].\n\nYour job is to:\n- Answer common questions about hours, pricing, and availability\n- Take reservations and confirm bookings\n- Escalate complex issues to a human agent\n\nAlways be polite, concise, and helpful.`}
                    className={styles.promptTextarea}
                />
            </FieldRow>

            <div className={styles.divider} />
            <SectionLabel>Voice Behaviour</SectionLabel>

            <ToggleRow
                id="transcribe"
                label="Enable Transcription"
                hint="Store full call transcripts alongside recordings and summaries."
                checked={transcribe}
                onChange={setTranscribe}
            />

            <FieldRow
                label="Fallback Voice"
                hint="Used when your primary TTS provider is unavailable."
            >
                <Select
                    value={fallbackVoice}
                    onChange={e => setFallbackVoice(e.target.value)}
                    options={FALLBACK_VOICES}
                />
            </FieldRow>

            <div className={styles.divider} />
            <SectionLabel>Timing</SectionLabel>

            <div className={styles.sliderRow}>
                <div className={styles.fieldMeta}>
                    <Text size="sm" weight="medium">Wait Time Before Response</Text>
                    <Text size="xs" tone="muted">How long to wait after a caller stops speaking before responding.</Text>
                </div>
                <div className={styles.sliderControl}>
                    <input
                        type="range"
                        min={0}
                        max={30}
                        step={1}
                        value={waitTime}
                        onChange={e => setWaitTime(Number(e.target.value))}
                        className={styles.slider}
                        aria-label="Wait time in seconds"
                    />
                    <div className={styles.sliderMeta}>
                        <Text size="xs" tone="muted">0s</Text>
                        <div className={styles.sliderValue}>{waitTime}s</div>
                        <Text size="xs" tone="muted">30s</Text>
                    </div>
                </div>
            </div>
        </Stack>
    );
}

function KnowledgeBasePanel({ files, setFiles }: { files: any[], setFiles: React.Dispatch<React.SetStateAction<any[]>> }) {
    const [dragging, setDragging] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const dropped = Array.from(e.dataTransfer.files).map(f => ({
            name: f.name,
            size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
            type: f.name.split('.').pop()?.toUpperCase() ?? 'FILE',
            fileObj: f,
            uploaded: false
        }));
        setFiles(prev => [...prev, ...dropped]);
    }, [setFiles]);

    const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

    return (
        <Stack gap="24">
            <SectionLabel>Documents & Knowledge</SectionLabel>
            <Text size="sm" tone="muted">
                Upload files your agent should know about — menus, FAQs, SOPs, product sheets, etc.
                Supported formats: <strong>.pdf, .txt, .docx, .md, .csv</strong>
            </Text>

            <div
                className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
            >
                <div className={styles.dropIcon}>📂</div>
                <Text size="sm" weight="medium">Drop files here</Text>
                <Text size="xs" tone="muted">or click to browse (max 25 MB per file)</Text>
                <input
                    type="file"
                    multiple
                    accept=".pdf,.txt,.docx,.md,.csv"
                    className={styles.dropInput}
                    onChange={e => {
                        const picked = Array.from(e.target.files ?? []).map(f => ({
                            name: f.name,
                            size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
                            type: f.name.split('.').pop()?.toUpperCase() ?? 'FILE',
                            fileObj: f,
                            uploaded: false
                        }));
                        setFiles(prev => [...prev, ...picked]);
                    }}
                />
            </div>

            {files.length > 0 && (
                <Stack gap="8">
                    {files.map((f, i) => (
                        <div key={f.id || `${f.name}-${i}`} className={styles.fileRow}>
                            <span className={styles.fileType}>{f.type}</span>
                            <div className={styles.fileMeta}>
                                <Text size="sm" weight="medium">{f.name}</Text>
                                <Text size="xs" tone="muted">{f.size}</Text>
                            </div>
                            <button className={styles.removeBtn} onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}>
                                ✕
                            </button>
                        </div>
                    ))}
                </Stack>
            )}

            <div className={styles.kbNote}>
                <span>🔍</span>
                <Text size="xs" tone="muted">
                    Files are chunked and embedded into your agent's vector knowledge base. Updates take ~30 seconds to propagate.
                </Text>
            </div>
        </Stack>
    );
}

function AnalyticsPanel({
    callSummary, setCallSummary, agentId
}: {
    callSummary: boolean; setCallSummary: (v: boolean) => void; agentId: string;
}) {
    const [activeTab, setActiveTab] = useState<'logs' | 'reservations'>('logs');
    const [logs, setLogs] = React.useState<any[]>([]);
    const [reservations, setReservations] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    const fetchData = useCallback(async () => {
        if (!agentId) return;
        setLoading(true);
        try {
            // 1. Fetch Call Logs
            const logRes = await fetch(`/api/analytics?agent_id=${agentId}`);
            const logData = await logRes.json();
            if (logData.logs) setLogs(logData.logs);

            // 2. Fetch Reservations
            const resRes = await fetch(`/api/reservations?agent_id=${agentId}`);
            const resData = await resRes.json();
            if (Array.isArray(resData)) setReservations(resData);
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
        } finally {
            setLoading(false);
        }
    }, [agentId]);

    React.useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchData]);

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const formatDate = (isoStr: string) => {
        if (!isoStr) return '--';
        try {
            const date = new Date(isoStr);
            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) { return isoStr; }
    };

    return (
        <Stack gap="24">
            <Cluster justify="between">
                <SectionLabel>Call Analytics Settings</SectionLabel>
                {loading && <Text size="xs" tone="muted">Refreshing...</Text>}
            </Cluster>

            <ToggleRow
                id="callSummary"
                label="AI Call Summaries"
                hint="Auto-generate a natural-language summary of every call using LLM."
                checked={callSummary}
                onChange={setCallSummary}
            />

            <div className={styles.divider} />

            <div className={styles.analyticsTabBar}>
                <button
                    className={`${styles.analyticsTab} ${activeTab === 'logs' ? styles.analyticsTabActive : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    📋 Call Logs
                </button>
                <button
                    className={`${styles.analyticsTab} ${activeTab === 'reservations' ? styles.analyticsTabActive : ''}`}
                    onClick={() => setActiveTab('reservations')}
                >
                    🗓️ Reservations
                </button>
            </div>

            {activeTab === 'logs' && (
                <div className={styles.tableWrapper}>
                    <table className={styles.logTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Caller</th>
                                <th>Duration</th>
                                <th>Intent</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length > 0 ? logs.map((log, i) => (
                                <tr key={log.id}>
                                    <td className={styles.logId}>CL-{log.id.slice(0, 4)}</td>
                                    <td>{log.caller_number || log.phone_number || 'Unknown'}</td>
                                    <td>{formatDuration(log.duration)}</td>
                                    <td>{log.intent || 'Unknown'}</td>
                                    <td className={styles.logTs}>{formatDate(log.created_at)}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[`status-${log.status || 'resolved'}`]}`}>
                                            {log.status || 'resolved'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', opacity: 0.5 }}>
                                        No call logs found for this agent yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'reservations' && (
                <div className={styles.tableWrapper}>
                    <table className={styles.logTable}>
                        <thead>
                            <tr>
                                <th>Guest</th>
                                <th>Phone</th>
                                <th>Date/Time</th>
                                <th>Guests</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.length > 0 ? reservations.map((res, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500 }}>{res.customer_name}</td>
                                    <td>{res.phone}</td>
                                    <td className={styles.logTs}>
                                        {res.date} at {res.time?.slice(0, 5)}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{res.guests}</td>
                                    <td>
                                        <Badge variant={res.status === 'confirmed' ? 'success' : 'neutral'}>
                                            {res.status}
                                        </Badge>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', opacity: 0.5 }}>
                                        No reservations recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </Stack>
    );
}

function CompliancePanel({
    aiDisclosure, setAiDisclosure,
    disclosureText, setDisclosureText,
    recordingAnnouncement, setRecordingAnnouncement,
    recordingScript, setRecordingScript,
}: {
    aiDisclosure: boolean; setAiDisclosure: (v: boolean) => void;
    disclosureText: string; setDisclosureText: (v: string) => void;
    recordingAnnouncement: boolean; setRecordingAnnouncement: (v: boolean) => void;
    recordingScript: string; setRecordingScript: (v: string) => void;
}) {
    return (
        <Stack gap="24">
            <div className={styles.complianceHero}>
                <div className={styles.shieldIcon}>🛡️</div>
                <div>
                    <Heading as="h3" size="sm">Compliance & Privacy</Heading>
                    <Text size="sm" tone="muted">
                        Configure disclosures and data handling to stay aligned with GDPR, DPDP, TCPA, and local regulations.
                    </Text>
                </div>
            </div>

            <SectionLabel>AI Disclosure</SectionLabel>

            <ToggleRow
                id="aiDisclosure"
                label="Announce AI Identity"
                hint="Legally required in many jurisdictions. Agent identifies itself as an AI at call start."
                checked={aiDisclosure}
                onChange={setAiDisclosure}
            />

            {aiDisclosure && (
                <FieldRow
                    label="Disclosure Wording"
                    hint="Spoken verbatim before the first message."
                >
                    <Input
                        inputSize="md"
                        value={disclosureText}
                        onChange={e => setDisclosureText(e.target.value)}
                        placeholder="This call is handled by an AI assistant."
                    />
                </FieldRow>
            )}

            <div className={styles.divider} />
            <SectionLabel>Recording Notice</SectionLabel>

            <ToggleRow
                id="recordingAnnouncement"
                label="Recording Announcement"
                hint="Inform callers that the call may be recorded. Required under GDPR, CCPA, and many local laws."
                checked={recordingAnnouncement}
                onChange={setRecordingAnnouncement}
            />

            {recordingAnnouncement && (
                <FieldRow
                    label="Announcement Script"
                    hint="Played before the first agent message."
                >
                    <Input
                        inputSize="md"
                        value={recordingScript}
                        onChange={e => setRecordingScript(e.target.value)}
                        placeholder="This call may be recorded for quality and training purposes."
                    />
                </FieldRow>
            )}

            <div className={styles.divider} />
            <SectionLabel>Data Security</SectionLabel>

            <div className={styles.securityGrid}>
                {[
                    { icon: '🔒', title: 'AES-256 Encryption', desc: 'All call data encrypted at rest and in transit.' },
                    { icon: '🗄️', title: 'Data Residency', desc: 'Choose storage region (US / EU / IN / UAE).' },
                    { icon: '📅', title: 'Auto Retention Policy', desc: 'Recordings and logs auto-deleted after 90 days by default.' },
                    { icon: '🔑', title: 'Access Controls', desc: 'Role-based access for team members.' },
                    { icon: '📜', title: 'Audit Logs', desc: 'Full audit trail for every configuration change.' },
                    { icon: '🚫', title: 'No Training on Your Data', desc: 'Your calls are never used to train external models.' },
                ].map(item => (
                    <div key={item.title} className={styles.securityCard}>
                        <div className={styles.secIcon}>{item.icon}</div>
                        <div>
                            <Text size="sm" weight="medium">{item.title}</Text>
                            <Text size="xs" tone="muted">{item.desc}</Text>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.complianceBadges}>
                {['GDPR Ready', 'DPDP Compliant', 'TCPA Aware', 'SOC 2 Type II', 'TLS 1.3', 'AES-256'].map(b => (
                    <span key={b} className={styles.compBadge}>{b}</span>
                ))}
            </div>
        </Stack>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VoiceClientPage() {
    const [activeTab, setActiveTab] = useState<Tab>('AI Models');

    // Auth and Agent State
    const [userId, setUserId] = useState<string>('');
    const [agentId, setAgentId] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // Toast Notification Hook
    const { addToast } = useToast();

    // Knowledge Base State
    const [files, setFiles] = useState<{ name: string; size: string; type: string; fileObj?: File; uploaded: boolean }[]>([]);

    React.useEffect(() => {
        // Fetch current user id on mount
        fetch('/api/auth/me').then(r => r.json()).then(d => {
            if (d.user && d.user.id) {
                const uid = d.user.id;
                setUserId(uid);
                // Fetch agent config
                fetch(`/api/agent/get-config`, { cache: 'no-store' })
                    .then(r => r.json())
                    .then(res => {
                        if (res.error) {
                            addToast("Failed to load agent config: " + res.error, "error");
                            return;
                        }
                        if (res.agent) {
                            const a = res.agent;
                            setAgentId(a.id);
                            if (a.system_prompt) setPrompt(a.system_prompt);
                            if (a.first_message) setFirstMsg(a.first_message);
                            if (a.llm_model) setLlm(a.llm_model);
                            if (a.stt_provider) setStt(a.stt_provider);
                            if (a.tts_voice) setTts(a.tts_voice);
                            if (a.transcription_enabled !== undefined) setTranscribe(a.transcription_enabled);
                            if (a.wait_time !== undefined) setWaitTime(a.wait_time);
                            if (a.ai_disclosure !== undefined) setAiDisclosure(a.ai_disclosure);
                            if (a.disclosure_text) setDisclosureText(a.disclosure_text);
                            if (a.recording_announcement !== undefined) setRecordingAnnouncement(a.recording_announcement);
                            if (a.recording_script) setRecordingScript(a.recording_script);
                        }
                        if (res.files && res.files.length > 0) {
                            const loadedFiles = res.files.map((f: any) => ({
                                name: f.file_name,
                                size: 'Stored',
                                type: f.file_name?.split('.').pop() || 'txt',
                                uploaded: true,
                                id: f.id
                            }));
                            setFiles(loadedFiles);
                        }
                    })
                    .catch(err => console.error('Error fetching agent:', err));
            }
        }).catch(err => console.error(err));
    }, []);

    const handleSaveAndDeploy = async () => {
        if (!userId) { addToast("Please wait for auth or re-login.", "error"); return; }
        setIsSaving(true);
        try {
            // 1. Save config
            const res = await fetch('/api/agent/save-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent_id: agentId,
                    system_prompt: prompt,
                    first_message: firstMsg,
                    llm_model: llm,
                    stt_provider: stt,
                    tts_voice: tts,
                    transcription_enabled: transcribe,
                    wait_time: waitTime,
                    ai_disclosure: aiDisclosure,
                    disclosure_text: disclosureText,
                    recording_announcement: recordingAnnouncement,
                    recording_script: recordingScript
                })
            }).catch(err => {
                throw new Error("Step 1 (Config) Network Error: " + err.message);
            });

            const data = await res.json();
            if (data.error) throw new Error("Step 1 Backend Error: " + data.error);
            const newAgentId = data.agent_id;
            setAgentId(newAgentId);

            // 2. Upload KB files
            let updatedFiles = [...files];
            for (let i = 0; i < updatedFiles.length; i++) {
                const fileItem = updatedFiles[i];
                if (!fileItem.uploaded && fileItem.fileObj) {
                    const formData = new FormData();
                    formData.append('file', fileItem.fileObj);
                    formData.append('agent_id', newAgentId);
                    const uRes = await fetch(`${BACKEND_URL}/api/kb/upload`, {
                        method: 'POST',
                        body: formData
                    }).catch(err => {
                        throw new Error("Step 2 (KB Upload) Network Error: " + err.message);
                    });

                    if (uRes.ok) {
                        updatedFiles[i].uploaded = true;
                    } else {
                        throw new Error('Failed to upload ' + fileItem.name);
                    }
                }
            }
            setFiles(updatedFiles);
            addToast("Agent saved and configured!", "success");
        } catch (err: any) {
            addToast("Failed to save: " + err.message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    // AI Models state
    const [llm, setLlm] = useState('gpt-4o');
    const [stt, setStt] = useState('deepgram-nova-2');
    const [tts, setTts] = useState('el-rachel');

    // Behaviour state
    const [firstMsg, setFirstMsg] = useState('');
    const [prompt, setPrompt] = useState('');
    const [transcribe, setTranscribe] = useState(true);
    const [fallbackVoice, setFallbackVoice] = useState('openai-alloy');
    const [waitTime, setWaitTime] = useState(1);

    // Analytics state
    const [callSummary, setCallSummary] = useState(true);

    // Compliance state
    const [aiDisclosure, setAiDisclosure] = useState(true);
    const [disclosureText, setDisclosureText] = useState('This call is handled by an AI assistant.');
    const [recordingAnnouncement, setRecordingAnnouncement] = useState(true);
    const [recordingScript, setRecordingScript] = useState('This call may be recorded for quality and training purposes.');

    return (
        <main>
            <WaveformBackground />

            {/* ── Page Header ── */}
            <div className={styles.pageHeader}>
                <Container maxWidth="layout">
                    <div className={styles.headerInner}>
                        <div>
                            <div className={styles.headerPill}>Voice Agent Dashboard</div>
                            <Heading as="h1" size="xl" className={styles.pageTitle}>
                                Configure Your Agent
                            </Heading>
                            <Text size="sm" tone="muted" className={styles.pageSubtitle}>
                                Customise every aspect of how your AI voice agent sounds, behaves, and handles compliance.
                            </Text>
                        </div>
                        <Cluster gap="12">
                            <Button variant="ghost" size="md" onClick={async () => {
                                await fetch('/api/auth/logout', { method: 'POST' });
                                window.location.href = '/auth';
                            }}>
                                Logout
                            </Button>
                            <Button variant="brand" size="md" leftIcon={<span>💾</span>} disabled={isSaving} onClick={handleSaveAndDeploy}>
                                {isSaving ? "Saving..." : "Save & Deploy"}
                            </Button>
                        </Cluster>
                    </div>
                </Container>
            </div>

            {/* ── Tab Navigation ── */}
            <div className={styles.tabNav}>
                <Container maxWidth="layout">
                    <div className={styles.tabStrip}>
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {{
                                    'AI Models': '🧠',
                                    'Behaviour': '🎛️',
                                    'Knowledge Base': '📚',
                                    'Analytics': '📊',
                                    'Compliance': '🛡️',
                                }[tab]}
                                {' '}{tab}
                            </button>
                        ))}
                    </div>
                </Container>
            </div>

            {/* ── Main Content ── */}
            <Container maxWidth="layout">
                <div className={styles.contentArea}>
                    <Grid columns={{ base: 1, lg: 3 }} gap="24">
                        {/* Left: Config Panel */}
                        <div className={styles.configPanel}>
                            <Surface padding="lg" elevation="md" radius="lg">
                                {activeTab === 'AI Models' && (
                                    <AiModelsPanel
                                        llm={llm} setLlm={setLlm}
                                        stt={stt} setStt={setStt}
                                        tts={tts} setTts={setTts}
                                    />
                                )}
                                {activeTab === 'Behaviour' && (
                                    <BehaviourPanel
                                        firstMsg={firstMsg} setFirstMsg={setFirstMsg}
                                        prompt={prompt} setPrompt={setPrompt}
                                        transcribe={transcribe} setTranscribe={setTranscribe}
                                        fallbackVoice={fallbackVoice} setFallbackVoice={setFallbackVoice}
                                        waitTime={waitTime} setWaitTime={setWaitTime}
                                    />
                                )}
                                {activeTab === 'Knowledge Base' && <KnowledgeBasePanel files={files} setFiles={setFiles} />}
                                {activeTab === 'Analytics' && (
                                    <AnalyticsPanel callSummary={callSummary} setCallSummary={setCallSummary} agentId={agentId} />
                                )}
                                {activeTab === 'Compliance' && (
                                    <CompliancePanel
                                        aiDisclosure={aiDisclosure} setAiDisclosure={setAiDisclosure}
                                        disclosureText={disclosureText} setDisclosureText={setDisclosureText}
                                        recordingAnnouncement={recordingAnnouncement} setRecordingAnnouncement={setRecordingAnnouncement}
                                        recordingScript={recordingScript} setRecordingScript={setRecordingScript}
                                    />
                                )}
                            </Surface>
                        </div>

                        {/* Right: Live Preview / Status Sidebar */}
                        <div className={styles.sidebarPanel}>
                            {/* Agent Status Card */}
                            <Surface padding="lg" elevation="sm" radius="lg">
                                <Stack gap="16">
                                    <div className={styles.agentStatusHeader}>
                                        <div className={styles.agentAvatar}>🤖</div>
                                        <div>
                                            <Text size="sm" weight="medium">Agent Status</Text>
                                            <div className={styles.statusLive}>
                                                <span className={styles.statusDot} />
                                                Live
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.statusRows}>
                                        <div className={styles.statusRow}>
                                            <Text size="xs" tone="muted">LLM</Text>
                                            <Badge variant="neutral">{LLM_MODELS.find(m => m.value === llm)?.label.split('(')[0].trim() ?? llm}</Badge>
                                        </div>
                                        <div className={styles.statusRow}>
                                            <Text size="xs" tone="muted">STT</Text>
                                            <Badge variant="neutral">{STT_MODELS.find(m => m.value === stt)?.label.split('(')[0].trim() ?? stt}</Badge>
                                        </div>
                                        <div className={styles.statusRow}>
                                            <Text size="xs" tone="muted">TTS Voice</Text>
                                            <Badge variant="neutral">{TTS_VOICES.find(m => m.value === tts)?.label.split('—')[0].trim() ?? tts}</Badge>
                                        </div>
                                        <div className={styles.statusRow}>
                                            <Text size="xs" tone="muted">Transcription</Text>
                                            <Badge variant={transcribe ? 'success' : 'neutral'}>{transcribe ? 'On' : 'Off'}</Badge>
                                        </div>
                                        <div className={styles.statusRow}>
                                            <Text size="xs" tone="muted">Wait Time</Text>
                                            <Badge variant="neutral">{waitTime}s</Badge>
                                        </div>
                                    </div>
                                </Stack>
                            </Surface>

                            {/* Quick Stats */}
                            <Surface padding="lg" elevation="sm" radius="lg">
                                <Stack gap="12">
                                    <Text size="sm" weight="medium">This Week</Text>
                                    <div className={styles.quickStats}>
                                        <div className={styles.quickStat}>
                                            <div className={styles.statNum}>247</div>
                                            <Text size="xs" tone="muted">Calls Handled</Text>
                                        </div>
                                        <div className={styles.quickStat}>
                                            <div className={styles.statNum}>94%</div>
                                            <Text size="xs" tone="muted">Resolution Rate</Text>
                                        </div>
                                        <div className={styles.quickStat}>
                                            <div className={styles.statNum}>1.8s</div>
                                            <Text size="xs" tone="muted">Avg. Latency</Text>
                                        </div>
                                    </div>
                                </Stack>
                            </Surface>

                            {/* Compliance Summary */}
                            <Surface padding="lg" elevation="sm" radius="lg">
                                <Stack gap="12">
                                    <Text size="sm" weight="medium">Compliance Checklist</Text>
                                    <Stack gap="8">
                                        {[
                                            { label: 'AI Disclosure', on: aiDisclosure },
                                            { label: 'Recording Notice', on: recordingAnnouncement },
                                            { label: 'Data Encryption', on: true },
                                            { label: 'Call Audit Logs', on: true },
                                        ].map(item => (
                                            <div key={item.label} className={styles.complianceItem}>
                                                <span className={item.on ? styles.checkOn : styles.checkOff}>
                                                    {item.on ? '✓' : '○'}
                                                </span>
                                                <Text size="xs">{item.label}</Text>
                                            </div>
                                        ))}
                                    </Stack>
                                </Stack>
                            </Surface>

                            {/* Save CTA */}
                            <Button
                                variant="brand"
                                size="md"
                                fullWidth
                                leftIcon={<span>🚀</span>}
                                disabled={isSaving}
                                onClick={handleSaveAndDeploy}
                            >
                                {isSaving ? "Saving..." : "Save & Deploy Agent"}
                            </Button>
                        </div>
                    </Grid>
                </div>
            </Container>
        </main>
    );
}

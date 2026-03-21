'use client';

import React, { useState } from 'react';
import { Providers } from '@/components/ui/Providers';
import { Container } from '@/components/ui/layout/Container';
import { Stack } from '@/components/ui/layout/Stack';
import { Section } from '@/components/ui/layout/Section';
import { Surface } from '@/components/ui/layout/Surface';
import { Cluster } from '@/components/ui/layout/Cluster';
import { Grid } from '@/components/ui/layout/Grid';
import { GridItem } from '@/components/ui/layout/GridItem';
import { Divider } from '@/components/ui/layout/Divider';
import { AspectRatio } from '@/components/ui/layout/AspectRatio';
import { Spacer } from '@/components/ui/layout/Spacer';
import { Flex } from '@/components/ui/layout/Flex';

import { Heading } from '@/components/ui/typography/Heading';
import { Text } from '@/components/ui/typography/Text';
import { Code } from '@/components/ui/typography/Code';
import { Kbd } from '@/components/ui/typography/Kbd';
import { Link } from '@/components/ui/typography/Link';

import { Button } from '@/components/ui/forms/Button';
import { IconButton } from '@/components/ui/forms/IconButton';
import { Input } from '@/components/ui/forms/Input';
import { Textarea } from '@/components/ui/forms/Textarea';
import { Select } from '@/components/ui/forms/Select';
import { Switch } from '@/components/ui/forms/Switch';
import { Checkbox } from '@/components/ui/forms/Checkbox';
import { RadioGroup } from '@/components/ui/forms/RadioGroup';
import { Label } from '@/components/ui/forms/Label';
import { FormField } from '@/components/ui/forms/FormField';
import { HelperText } from '@/components/ui/forms/HelperText';
import { ErrorText } from '@/components/ui/forms/ErrorText';

import { Badge } from '@/components/ui/data/Badge';
import { Avatar } from '@/components/ui/data/Avatar';
import { StatCard } from '@/components/ui/data/StatCard';
import { Table } from '@/components/ui/data/Table';
import { Accordion } from '@/components/ui/data/Accordion';
import { Skeleton } from '@/components/ui/data/Skeleton';
import { EmptyState } from '@/components/ui/data/EmptyState';

import { Hero } from '@/components/ui/marketing/Hero';
import { FeatureGrid } from '@/components/ui/marketing/FeatureGrid';
import { PricingCard } from '@/components/ui/marketing/PricingCard';
import { Testimonial } from '@/components/ui/marketing/Testimonial';
import { CTA } from '@/components/ui/marketing/CTA';
import { LogoCloud } from '@/components/ui/marketing/LogoCloud';
import { ThemeImage } from '@/components/ui/marketing/ThemeImage';
import { ChatPage, Message } from '@/components/ui/chatbox/ChatPage';

import { Tabs } from '@/components/ui/navigation/Tabs';
import { Breadcrumbs } from '@/components/ui/navigation/Breadcrumbs';
import { Pagination } from '@/components/ui/navigation/Pagination';

import { Tooltip } from '@/components/ui/overlays/Tooltip';
import { Popover } from '@/components/ui/overlays/Popover';
import { Dialog } from '@/components/ui/overlays/Dialog';
import { ToastProvider, useToast } from '@/components/ui/overlays/Toast';

import NetBGE from '@/components/effects/NetBGE';
import SwarmsBGE from '@/components/effects/SwarmsBGE';
import EmbersBGE from '@/components/effects/EmbersBGE';
import WaveformBackground from '@/components/effects/WaveformBackground';
import { ImBgAurora } from '@/components/effects/ImBgAurora';
import { CursorGlow } from '@/components/effects/CursorGlow';

function DemoContent() {
  const { addToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [bgType, setBgType] = useState<'net' | 'swarms' | 'embers' | 'waveform' | 'aurora'>('net');
  const [isChatActive, setIsChatActive] = useState(false);
  const [initialChatMessages, setInitialChatMessages] = useState<Message[]>([]);

  const handleInitialPrompt = (prompt: string) => {
    setInitialChatMessages([
      {
        id: 'user-1',
        role: 'user',
        parts: [{ type: 'text', text: prompt }],
        timestamp: new Date().toISOString()
      }
    ]);
    setIsChatActive(true);
  };

  const renderBackground = () => {
    switch (bgType) {
      case 'swarms': return <SwarmsBGE />;
      case 'embers': return <EmbersBGE />;
      case 'waveform': return <WaveformBackground />;
      case 'aurora': return <ImBgAurora />;
      default: return <NetBGE />;
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col">
      {renderBackground()}
      <CursorGlow />

      <Container className="relative z-10 py-20 flex-grow">
        <Hero
          badge="Complete Component Showcase"
          title="The Full Imadgen UI Library"
          description="Explore every single component and effect available in our premium kit."
          actions={
            <Cluster gap="16" justify="center">
              <Button variant="primary" size="lg">Get Started</Button>
              <Button variant="secondary" as="a" href="https://github.com/yushrut/imadgen-next">Documentation</Button>
            </Cluster>
          }
        />

        <Spacer size="64" />

        <Tabs
          defaultValue="typography"
          items={[
            {
              value: 'typography',
              label: 'Typography',
              content: (
                <Surface padding="lg" elevation="md" radius="lg">
                  <Stack gap="32">
                    <Stack gap="16">
                      <Heading as="h1" size="display">Display Heading 1</Heading>
                      <Heading as="h2" size="xxl">Section Heading 2</Heading>
                      <Heading as="h3" size="xl">Content Heading 3</Heading>
                      <Heading as="h4" size="lg">Feature Heading 4</Heading>
                      <Heading as="h5" size="md">Medium Heading 5</Heading>
                      <Heading as="h6" size="sm">Small Heading 6</Heading>
                    </Stack>
                    <Divider />
                    <Stack gap="16">
                      <Text size="lg">Large body text for prominent paragraphs and introductions.</Text>
                      <Text size="md">Medium body text. This is the default text size used for most content on the page.</Text>
                      <Text size="sm" tone="muted">Small muted text for captions, footnotes, and secondary information.</Text>
                      <Text size="xs" tone="brand">Extra small brand text for labels and micro-copy.</Text>
                    </Stack>
                    <Divider />
                    <Stack gap="16">
                      <Label>Inline Elements</Label>
                      <Cluster gap="12">
                        <Code>npm install @imadgen/ui</Code>
                        <Text>Press <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd> to copy.</Text>
                        <Link href="#">Internal Navigation Link</Link>
                      </Cluster>
                    </Stack>
                  </Stack>
                </Surface>
              )
            },
            {
              value: 'forms',
              label: 'Forms',
              content: (
                <Surface padding="lg" elevation="md" radius="lg">
                  <Grid columns={{ base: 1, md: 2 }} gap="48">
                    <Stack gap="32">
                      <Stack gap="16">
                        <Heading size="md" className="mb-4">Form Infrastructure</Heading>
                        <FormField
                          id="username-field"
                          label="Username"
                          hint="This is your public display name."
                        >
                          <Input placeholder="imadgen_user" />
                        </FormField>
                        <FormField
                          id="email-field"
                          label="Email Address"
                          error="Please provide a valid enterprise email."
                        >
                          <Input placeholder="user@company.com" invalid />
                        </FormField>
                        <FormField id="bio-field" label="Bio">
                          <Textarea placeholder="Tell us about yourself..." rows={3} />
                          <HelperText>Max 200 characters.</HelperText>
                        </FormField>
                      </Stack>
                      <Stack gap="16">
                        <Label>Label Utilities</Label>
                        <Stack gap="8">
                          <Label>Default Label</Label>
                          <HelperText>This is a helper text providing context.</HelperText>
                          <ErrorText>This is an error text highlighting an issue.</ErrorText>
                        </Stack>
                      </Stack>
                    </Stack>

                    <Stack gap="32">
                      <Stack gap="16">
                        <Heading size="md" className="mb-4">Input Selection</Heading>
                        <Stack gap="12">
                          <Checkbox id="marketing" label="Receive weekly updates" />
                          <Checkbox id="terms" label="I agree to the terms of service" defaultChecked />
                        </Stack>
                        <Divider />
                        <Stack gap="12">
                          <Label>Radio Selection</Label>
                          <RadioGroup
                            items={[
                              { id: 'r1', value: 'light', label: 'Light Theme' },
                              { id: 'r2', value: 'dark', label: 'Dark Theme' },
                              { id: 'r3', value: 'system', label: 'System Sync', disabled: true },
                            ]}
                            defaultValue="dark"
                          />
                        </Stack>
                        <Divider />
                        <Stack gap="8">
                          <Label>Toggle Switches</Label>
                          <Cluster gap="24">
                            <Stack gap="4">
                              <Switch id="s1" aria-label="Notifications" defaultChecked />
                              <Text size="xs" tone="muted">Alerts</Text>
                            </Stack>
                            <Stack gap="4">
                              <Switch id="s2" aria-label="Privacy" />
                              <Text size="xs" tone="muted">Ghost</Text>
                            </Stack>
                          </Cluster>
                        </Stack>
                      </Stack>

                      <Stack gap="16">
                        <Label>Select & Buttons</Label>
                        <Select
                          options={[
                            { label: 'Engineering', value: 'eng' },
                            { label: 'Marketing', value: 'mkt' },
                            { label: 'Sales', value: 'sales' },
                          ]}
                          defaultValue="eng"
                        />
                        <Cluster gap="12">
                          <Button variant="primary">Submit</Button>
                          <Button variant="secondary">Secondary</Button>
                          <IconButton variant="ghost" aria-label="Delete">
                            <span>🗑️</span>
                          </IconButton>
                        </Cluster>
                      </Stack>
                    </Stack>
                  </Grid>
                </Surface>
              )
            },
            {
              value: 'data',
              label: 'Data',
              content: (
                <Stack gap="48">
                  <Grid columns={{ base: 1, md: 3 }} gap="24">
                    <StatCard label="Total Nodes" value="2,840" note="+14% this week" variant="neutral" />
                    <StatCard label="Signal Strength" value="98%" note="Optimal" variant="success" />
                    <StatCard label="Latency" value="12ms" note="Low latency" variant="success" />
                  </Grid>

                  <Grid columns={{ base: 1, md: 2 }} gap="32">
                    <Surface padding="lg" elevation="sm" radius="md">
                      <Heading size="md" className="mb-6">Data Overview</Heading>
                      <Table
                        headers={['Entity', 'Status', 'Load']}
                        rows={[
                          ['Primary Core', <Badge key="b1" variant="success">Online</Badge>, '24%'],
                          ['Worker Node A', <Badge key="b2" variant="warning">Throttled</Badge>, '89%'],
                          ['Storage Cluster', <Badge key="b3" variant="danger">Down</Badge>, '0%'],
                        ]}
                      />
                    </Surface>
                    <Stack gap="24">
                      <Surface padding="lg" elevation="sm" radius="md">
                        <Heading size="md" className="mb-4">Navigation Tree</Heading>
                        <Accordion
                          items={[
                            { value: 'sys', title: 'System Logs', content: 'Detailed logs of all system activities and signals.' },
                            { value: 'net', title: 'Network Topology', content: 'Visual representation of current node connections.' },
                          ]}
                        />
                      </Surface>
                      <Surface padding="lg" elevation="sm" radius="md">
                        <EmptyState
                          title="No Active Signals"
                          description="Connect a device to start receiving data streams."
                          action={<Button variant="primary" size="sm">Connect Device</Button>}
                        />
                      </Surface>
                    </Stack>
                  </Grid>

                  <Grid columns={{ base: 1, md: 3 }} gap="24">
                    <Surface padding="lg" elevation="sm" radius="md">
                      <Heading size="sm" className="mb-4">Avatars</Heading>
                      <Cluster gap="12">
                        <Avatar src="https://i.pravatar.cc/150?u=12" fallback="JD" size="lg" />
                        <Avatar src="https://i.pravatar.cc/150?u=15" fallback="SC" size="lg" />
                        <Avatar fallback="AI" size="lg" />
                      </Cluster>
                    </Surface>
                    <Surface padding="lg" elevation="sm" radius="md">
                      <Heading size="sm" className="mb-4">Badges</Heading>
                      <Cluster gap="8">
                        <Badge variant="brand">Brand</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="danger">Critical</Badge>
                      </Cluster>
                    </Surface>
                    <Surface padding="lg" elevation="sm" radius="md">
                      <Heading size="sm" className="mb-4">Progress Placeholders</Heading>
                      <Stack gap="12">
                        <Skeleton height="20px" width="100%" />
                        <Skeleton height="16px" width="70%" />
                      </Stack>
                    </Surface>
                  </Grid>
                </Stack>
              )
            },
            {
              value: 'marketing',
              label: 'Marketing',
              content: (
                <Stack gap="64">
                  <LogoCloud
                    title="Powering the next generation of AI startups"
                    logos={[]}
                  />

                  <FeatureGrid
                    columns={3}
                    features={[
                      { title: 'Neural Compute', description: 'Scale your inference across thousands of distributed edge nodes.' },
                      { title: 'Vector Storage', description: 'High-dimensional data indexing with sub-millisecond retrieval.' },
                      { title: 'Autonomic Healing', description: 'Self-repairing infrastructure that adapts to traffic fluctuations.' },
                    ]}
                  />

                  <Grid columns={{ base: 1, lg: 2 }} gap="48" align="center">
                    <PricingCard
                      name="Infinity Plan"
                      price="Adaptive"
                      frequency="/project"
                      description="Dynamic pricing that scales with your usage and performance needs."
                      features={['Unlimited Tokens', 'Custom Foundational Models', 'Dedicated H100 Clusters', '24/7 Redline Support']}
                      action={<Button variant="primary" fullWidth>Request Early Access</Button>}
                      featured
                    />
                    <Stack gap="32">
                      <Testimonial
                        quote="The level of abstraction Imadgen provides is unprecedented. We went from prototype to production in record time."
                        author="Kaitlyn Hayes"
                        role="Lead Engineer, NeuralFlow"
                      />
                    </Stack>
                  </Grid>

                  <CTA
                    title="The future is being coded right now."
                    description="Don't just watch it happen. Be the one who builds it."
                    actions={<Button variant="brand" size="lg">Join the Ecosystem</Button>}
                  />
                </Stack>
              )
            },
            {
              value: 'navigation',
              label: 'Navigation',
              content: (
                <Surface padding="lg" elevation="md" radius="lg">
                  <Stack gap="48">
                    <Stack gap="16">
                      <Label>Breadcrumbs</Label>
                      <Breadcrumbs
                        items={[
                          { label: 'Network', href: '#' },
                          { label: 'Nodes', href: '#' },
                          { label: 'Active Showcase' },
                        ]}
                      />
                    </Stack>
                    <Divider />
                    <Stack gap="16">
                      <Label>Pagination Control</Label>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={10}
                        onPageChange={setCurrentPage}
                      />
                    </Stack>
                    <Divider />
                    <Stack gap="16">
                      <Label>Deep Linking</Label>
                      <Text size="sm" tone="muted">Navigational primitives for complex application routing.</Text>
                      <Cluster gap="16">
                        <Link href="#">Internal Link</Link>
                        <Link href="https://google.com">External Link ↗</Link>
                      </Cluster>
                    </Stack>
                  </Stack>
                </Surface>
              )
            },
            {
              value: 'layout',
              label: 'Layout',
              content: (
                <Surface padding="lg" elevation="md" radius="lg">
                  <Stack gap="48">
                    <Grid columns={{ base: 1, md: 2 }} gap="32">
                      <Stack gap="16">
                        <Label>Aspect Ratio Management</Label>
                        <AspectRatio ratio={16 / 9}>
                          <div className="w-full h-full bg-brand/10 border border-brand/30 rounded-lg flex items-center justify-center">
                            <Text weight="semibold" tone="brand">16 : 9 Frame</Text>
                          </div>
                        </AspectRatio>
                      </Stack>
                      <Stack gap="16">
                        <Label>Flexible Box Model</Label>
                        <Flex direction="column" gap="12" className="p-4 bg-white/5 border border-white/10 rounded-lg">
                          <div className="h-8 bg-brand/20 rounded w-full" />
                          <Flex justify="between">
                            <div className="h-8 bg-white/10 rounded w-1/4" />
                            <div className="h-8 bg-white/10 rounded w-1/2" />
                          </Flex>
                        </Flex>
                        <Spacer size="8" />
                        <Label>Layout Spacers</Label>
                        <div className="border border-dashed border-white/20 p-2 text-center text-[10px] text-white/40">
                          Gap below
                        </div>
                        <Spacer size="24" />
                        <div className="border border-dashed border-white/20 p-2 text-center text-[10px] text-white/40">
                          Gap above
                        </div>
                      </Stack>
                    </Grid>
                    <Divider />
                    <Stack gap="16">
                      <Label>Sectioning & Containment</Label>
                      <Section size="sm" className="bg-brand/5 border border-brand/20 rounded-lg text-center">
                        <Text size="sm">This is a Section component with consistent padding.</Text>
                      </Section>
                    </Stack>
                  </Stack>
                </Surface>
              )
            },
            {
              value: 'effects',
              label: 'Effects',
              content: (
                <Surface padding="lg" elevation="md" radius="lg">
                  <Stack gap="32">
                    <Heading size="md">Environmental Systems</Heading>
                    <Text tone="muted">Switch the global environment to match your application's aesthetic signature.</Text>
                    <Grid columns={{ base: 1, md: 3 }} gap="16" className="mb-8">
                      <Button
                        variant={bgType === 'net' ? 'primary' : 'outline'}
                        onClick={() => { setBgType('net'); addToast('Switched to Neural Network', 'success'); }}
                      >
                        Neural Network
                      </Button>
                      <Button
                        variant={bgType === 'swarms' ? 'primary' : 'outline'}
                        onClick={() => { setBgType('swarms'); addToast('Switched to Particle Swarms', 'success'); }}
                      >
                        Particle Swarms
                      </Button>
                      <Button
                        variant={bgType === 'embers' ? 'primary' : 'outline'}
                        onClick={() => { setBgType('embers'); addToast('Switched to Rising Embers', 'success'); }}
                      >
                        Rising Embers
                      </Button>
                      <Button
                        variant={bgType === 'waveform' ? 'primary' : 'outline'}
                        onClick={() => { setBgType('waveform'); addToast('Switched to Energy Waveform', 'success'); }}
                      >
                        Energy Waveform
                      </Button>
                      <Button
                        variant={bgType === 'aurora' ? 'primary' : 'outline'}
                        onClick={() => { setBgType('aurora'); addToast('Switched to Celestial Aurora', 'success'); }}
                      >
                        Celestial Aurora
                      </Button>
                    </Grid>
                    <Divider />
                    <Stack gap="16">
                      <Label>Active Signal Tracking</Label>
                      <Text size="sm" tone="muted">Organic lighting feedback is provided via the Cursor Glow system, which tracks real-time input coordinates.</Text>
                      <div className="h-32 bg-gradient-to-r from-brand/20 to-transparent rounded-lg border-l-2 border-brand" />
                    </Stack>
                  </Stack>
                </Surface>
              )
            },
            {
              value: 'overlays',
              label: 'Overlays',
              content: (
                <Surface padding="lg" elevation="md" radius="lg">
                  <Stack gap="32" align="center">
                    <Cluster gap="24">
                      <Tooltip content="Contextual data tooltip">
                        <Button variant="outline">Hover Insight</Button>
                      </Tooltip>
                      <Popover trigger={<Button variant="outline">View Meta</Button>}>
                        <div style={{ padding: '20px', maxWidth: '280px' }}>
                          <Heading size="sm" className="mb-2">Signal Meta</Heading>
                          <Text size="sm" tone="muted">Origin: Node_1248<br />Protocols: AES-256, Quantum-V2<br />Integrity: Verified</Text>
                        </div>
                      </Popover>
                      <Button variant="primary" onClick={() => addToast('Signal parity established.', 'success')}>
                        Ping System
                      </Button>
                    </Cluster>

                    <Dialog
                      title="Override Protocol"
                      trigger={<Button variant="secondary">Initiate Override</Button>}
                    >
                      <Stack gap="16">
                        <Text>Warning: Initiating a manual override will temporarily desynchronize your local state. Do you wish to proceed with the bypass?</Text>
                        <Cluster gap="8" justify="end">
                          <Button variant="ghost">Abort</Button>
                          <Button variant="primary" onClick={() => addToast('Override successful.', 'success')}>Bypass</Button>
                        </Cluster>
                      </Stack>
                    </Dialog>
                  </Stack>
                </Surface>
              )
            },
            {
              value: 'interactive',
              label: 'Interactive',
              content: (
                <Surface padding="lg" elevation="md" radius="lg">
                  <Grid columns={{ base: 1, lg: 2 }} gap="48" align="center">
                    <Stack gap="24">
                      <Heading size="lg">Agent Intelligence</Heading>
                      <Text tone="muted">
                        {isChatActive
                          ? "The full interaction engine is now active. Explore the capabilities of our real-time response system."
                          : "Experience the responsiveness of our AI-ready components. Type a prompt below to initiate the interface."
                        }
                      </Text>
                      <Stack gap="12">
                        <Badge variant="brand">Real-time Latency: 12ms</Badge>
                        <Badge variant="success">Quantum Encryption Active</Badge>
                      </Stack>
                    </Stack>
                    <Flex justify="center" direction="column" className="w-full">
                      {isChatActive ? (
                        <ChatPage
                          initialMessages={initialChatMessages}
                          variant="compact"
                          onClose={() => setIsChatActive(false)}
                        />
                      ) : (
                        <ChatPage
                          variant="minimal"
                          onSendMessage={handleInitialPrompt}
                          placeholder="What would you like to build today?"
                        />
                      )}
                    </Flex>
                  </Grid>
                </Surface>
              )
            }
          ]}
        />
      </Container>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Providers>
      <ToastProvider>
        <DemoContent />
      </ToastProvider>
    </Providers>
  );
}
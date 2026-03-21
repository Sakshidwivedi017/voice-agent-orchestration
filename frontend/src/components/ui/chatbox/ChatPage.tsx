'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from './ChatContext';
import { UIMessage } from 'ai';
import { cn } from '@/lib/cn';
import { Surface } from '../layout/Surface';
import { Stack } from '../layout/Stack';
import { Flex } from '../layout/Flex';
import { Text } from '../typography/Text';
import { IconButton } from '../forms/IconButton';
import { Input } from '../forms/Input';
import styles from './ChatPage.module.css';

// Local Message interface for internal UI logic if needed, 
// though we primarily use UIMessage from the SDK now.
export interface Message extends UIMessage {
  timestamp?: string;
}

interface ChatPageProps {
  initialMessages?: Message[];
  className?: string;
  onSendMessage?: (content: string) => void;
  onClose?: () => void;
  isFullPage?: boolean;
  variant?: 'full' | 'compact' | 'minimal';
  placeholder?: string;
}

/**
 * ChatPage component with Vercel AI SDK v6 and Supabase integration.
 * Supports multiple variants for embedding across the application.
 */
export function ChatPage({
  initialMessages,
  className,
  onSendMessage,
  onClose,
  isFullPage,
  variant = 'full',
  placeholder = "Ask anything...",
}: ChatPageProps) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasCreatedSession = useRef(false);

  // Consume shared chat state from context
  const {
    messages,
    input,
    handleInputChange,
    append,
    handleSubmit: submitContext,
    status,
    isLoading: isChatLoading,
    setMessages,
    setIsChatActive,
    setInput
  } = useChatContext();

  const isStreaming = isChatLoading || status === 'submitted' || status === 'streaming';
  const canSend = status === 'ready' || !status;


  // Helper function to extract message content
  const getMessageContent = (msg: any): string => {
    if (msg.parts && Array.isArray(msg.parts)) {
      return msg.parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('');
    }
    return msg.content || '';
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Supabase save logic has been removed as per user request

  const handleEndChat = async () => {
    setMessages([]);
    if (onClose) {
      onClose();
    }
  };

  const handleChatSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() && canSend) {
      if (variant === 'minimal') {
        setIsChatActive(true);
      }

      const messageText = input.trim();

      // Trigger context's handleSubmit
      submitContext();

      if (onSendMessage) {
        onSendMessage(messageText);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <Surface
      elevation={variant === 'minimal' ? 'none' : 'md'}
      radius={isFullPage ? "none" : "lg"}
      className={cn(
        styles.container,
        isFullPage && styles.fullPage,
        variant === 'compact' && styles.compact,
        variant === 'minimal' && styles.minimal,
        className
      )}
      padding="none"
    >
      {/* Header */}
      <div className={styles.header}>
        <Flex align="center" justify="between" gap="12">
          <Flex align="center" gap="12">
            <div className={styles.statusDot} />
            <Stack gap="0">
              <Text weight="semibold" size="sm">Imadgen AI</Text>
              <Text size="xs" tone="muted">Quantum-V2 Core</Text>
            </Stack>
          </Flex>

          <Flex align="center" gap="8">
            {onClose && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={handleEndChat}
                aria-label="Close chat"
                className={styles.closeButton}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </IconButton>
            )}
          </Flex>
        </Flex>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <Text size="sm" tone="danger">{error}</Text>
        </div>
      )}

      {/* Messages Area */}
      <div className={styles.messagesArea} ref={scrollRef}>
        <Stack gap="16">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                styles.messageWrapper,
                message.role === 'user' ? styles.userWrapper : styles.assistantWrapper
              )}
            >
              <div className={cn(
                styles.bubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble
              )}>
                <Text size="sm">
                  {getMessageContent(message)}
                </Text>
              </div>
              <Text size="xs" tone="muted" className={styles.timestamp}>
                {(message as any).timestamp
                  ? new Date((message as any).timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              </Text>
            </div>
          ))}
          {isStreaming && (
            <div className={styles.assistantWrapper}>
              <div className={cn(styles.bubble, styles.assistantBubble, styles.typing)}>
                <div className={styles.dot} />
                <div className={styles.dot} />
                <div className={styles.dot} />
              </div>
            </div>
          )}
        </Stack>
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={styles.premiumWrapper}>
          <div className={styles.premiumGlow} />
          <div className={styles.premiumContainer}>
            <input
              type="text"
              className={styles.premiumInput}
              placeholder={placeholder}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={!canSend && variant !== 'minimal'}
            />
            <button
              className={styles.premiumSendButton}
              onClick={() => handleChatSubmit()}
              disabled={(!input.trim() || !canSend) && variant !== 'minimal'}
              aria-label="Send message"
            >
              <svg
                className={styles.premiumIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Surface>
  );
}

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useChat, UIMessage } from '@ai-sdk/react';

interface ChatContextType {
    messages: UIMessage[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e?: React.FormEvent) => void;
    append: (message: { role: 'user' | 'assistant' | 'system'; content: string }) => Promise<void>;
    status: string;
    isLoading: boolean;
    setMessages: (messages: UIMessage[]) => void;
    setInput: (input: string) => void;
    isChatActive: boolean;
    setIsChatActive: (active: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [isChatActive, setIsChatActive] = useState(false);
    const [input, setInput] = useState('');

    const {
        messages,
        sendMessage: sdkSendMessage,
        status,
        setMessages
    } = useChat();

    const isLoading = status === 'submitted' || status === 'streaming';

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInput(e.target.value);
    }, []);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const messageText = input.trim();
        if (!messageText || isLoading) return;

        setInput('');

        try {
            await sdkSendMessage({
                text: messageText
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            // Optionally restore input
            // setInput(messageText);
        }
    }, [input, isLoading, sdkSendMessage]);

    const append = useCallback(async (message: { role: 'user' | 'assistant' | 'system'; content: string }) => {
        await sdkSendMessage({
            text: message.content
        });
    }, [sdkSendMessage]);

    const value = useMemo(() => ({
        messages,
        input,
        handleInputChange,
        handleSubmit,
        append,
        status,
        isLoading,
        setMessages,
        setInput,
        isChatActive,
        setIsChatActive
    }), [
        messages,
        input,
        handleInputChange,
        handleSubmit,
        append,
        status,
        isLoading,
        setMessages,
        setInput,
        isChatActive,
        setIsChatActive
    ]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
}

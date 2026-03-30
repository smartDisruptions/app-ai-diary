'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { getProfile } from '@/lib/storage/profile';
import { MessageBubble } from '@/components/companion/MessageBubble';
import { ChatInput } from '@/components/companion/ChatInput';
import { TypingIndicator } from '@/components/companion/TypingIndicator';
import { RapportLevel } from '@/components/companion/RapportLevel';
import type { PersonalityProfile } from '@/types';

export default function CompanionPage() {
  const { messages, loading, error, sendMessage, clear } = useChat();
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-card">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-copper to-copper-deep flex items-center justify-center flex-shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#141416"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-text-heading text-base font-semibold leading-tight">
              AI Companion
            </span>
            {profile && <RapportLevel entryCount={profile.entryCount} />}
          </div>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-text-muted text-xs hover:text-copper transition-colors duration-200 cursor-pointer px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-copper to-copper-deep flex items-center justify-center mb-4 opacity-60">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#141416"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-text-muted text-sm">
              Start a conversation with your AI companion
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={`${msg.timestamp}-${i}`} message={msg} />
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-2xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 text-red-400 text-sm font-medium hover:text-red-300 transition-colors duration-200 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-border-card pb-safe">
        <ChatInput onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  );
}

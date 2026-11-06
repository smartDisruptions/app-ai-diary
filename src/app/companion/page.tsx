'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useChat } from '@/hooks/useChat';
import { getProfile } from '@/lib/storage/profile';
import { MessageBubble } from '@/components/companion/MessageBubble';
import { ChatInput } from '@/components/companion/ChatInput';
import { TypingIndicator } from '@/components/companion/TypingIndicator';
import { RapportLevel } from '@/components/companion/RapportLevel';
import { EmberMark } from '@/components/stream/EmberMark';
import { useCompanionName, useHasApiKey } from '@/hooks/useClientValues';
import type { PersonalityProfile } from '@/types';

/** Chat with the companion (Ember unless renamed). Always clearly an AI. */
export default function CompanionPage() {
  const { messages, loading, error, sendMessage, clear } = useChat();
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const name = useCompanionName();
  const aiOn = useHasApiKey();

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) sendMessage(lastUserMsg.content);
  };

  return (
    <div className="mx-auto flex h-[100dvh] max-w-2xl flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 pb-3 pt-[calc(16px+env(safe-area-inset-top,0px))] md:px-8 md:pt-8">
        <div className="flex min-w-0 items-center gap-3">
          <EmberMark size={40} blink={loading} />
          <div className="min-w-0">
            <h1 className="display truncate text-[28px] leading-none">{name}</h1>
            <p className="mt-1 truncate text-[12px] text-[var(--cream-soft)]">
              AI companion{profile ? ' · ' : ''}
              {profile && <RapportLevel entryCount={profile.entryCount} />}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="min-h-[44px] px-2 text-[13px] text-[var(--cream-soft)] transition-colors duration-200 hover:text-gold cursor-pointer"
          >
            Clear
          </button>
        )}
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5 md:px-8">
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <EmberMark size={72} blink />
            <h2 className="display mt-4 text-[32px]">Talk to {name}</h2>
            <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-[var(--cream-soft)]">
              {name} is an AI. It knows what you’ve shared in your entries and helps you think things through. Mention a
              task and it lands in your to-dos.
            </p>
            {!aiOn && (
              <Link href="/settings" className="mt-4 text-[14px] font-semibold text-gold underline underline-offset-4">
                Add an AI key in Settings to start
              </Link>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={`${msg.timestamp}-${i}`} message={msg} />
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <div className="rounded-2xl border border-[rgba(255,140,120,0.35)] bg-[rgba(255,140,120,0.08)] p-4" role="alert">
            <p className="text-[14px] text-[#ffb4a6]">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 min-h-[44px] text-[14px] font-semibold text-[#ffb4a6] cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[var(--line)] px-5 pt-3 pb-[calc(86px+env(safe-area-inset-bottom,0px))] md:px-8 md:pb-6">
        <ChatInput onSend={sendMessage} disabled={loading} placeholder={`Write to ${name}...`} />
      </div>
    </div>
  );
}

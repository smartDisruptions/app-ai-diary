'use client';

import React from 'react';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] px-4 py-3 ${
          isUser
            ? 'bg-[rgba(242,181,94,0.14)] border border-[rgba(242,181,94,0.28)] rounded-[20px] rounded-br-[6px]'
            : 'bg-[rgba(244,230,204,0.05)] border border-[rgba(244,230,204,0.1)] rounded-[20px] rounded-bl-[6px]'
        }`}
      >
        <p className="text-cream text-[15px] whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
        <p className="text-[var(--cream-faint)] mt-1.5" style={{ fontSize: '11px' }}>
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

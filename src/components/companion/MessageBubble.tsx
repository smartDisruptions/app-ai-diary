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
        className={`max-w-[80%] px-4 py-3 ${
          isUser
            ? 'bg-[rgba(196,154,108,0.12)] border border-[rgba(196,154,108,0.2)] rounded-[18px] rounded-br-[4px]'
            : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-[18px] rounded-bl-[4px]'
        }`}
      >
        <p className="text-text-body text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
        <p className="text-text-muted mt-1.5" style={{ fontSize: '10px' }}>
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

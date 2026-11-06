'use client';

import React, { useState } from 'react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled = false, placeholder = 'Type a message...' }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 min-w-0 min-h-[48px] bg-[rgba(244,230,204,0.05)] border border-[rgba(244,230,204,0.14)] text-cream text-[15px] rounded-3xl px-5 py-2.5 placeholder:text-[rgba(244,230,204,0.35)] focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-b from-[#f4c578] to-[#e19a3f] text-[#2a1709] flex items-center justify-center shadow-[0_8px_22px_-8px_rgba(242,181,94,0.6)] transition-opacity duration-200 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </button>
    </div>
  );
}

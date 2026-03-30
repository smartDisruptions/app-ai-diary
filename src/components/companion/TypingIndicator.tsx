'use client';

import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-[18px] rounded-bl-[4px] px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot h-2 w-2 rounded-full bg-copper" />
        <span
          className="typing-dot h-2 w-2 rounded-full bg-copper"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="typing-dot h-2 w-2 rounded-full bg-copper"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <style jsx>{`
        .typing-dot {
          display: inline-block;
          animation: typingBounce 1.2s ease-in-out infinite;
        }
        @keyframes typingBounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

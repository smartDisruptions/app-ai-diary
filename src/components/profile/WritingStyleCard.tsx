'use client';

import React from 'react';
import type { WritingStyle } from '@/types';

interface WritingStyleCardProps {
  writingStyle: WritingStyle;
}

function StyleBar({
  value,
  leftLabel,
  rightLabel,
  gradient,
  glow,
}: {
  value: number;
  leftLabel: string;
  rightLabel: string;
  gradient: string;
  glow: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between" style={{ fontSize: '12px', color: 'rgba(200,184,164,0.5)' }}>
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: gradient,
            /* subtle glow */
          }}
        />
      </div>
    </div>
  );
}

export function WritingStyleCard({ writingStyle }: WritingStyleCardProps) {
  return (
    <div className="space-y-5">
      <StyleBar
        value={writingStyle.formality}
        leftLabel="Casual"
        rightLabel="Formal"
        gradient="linear-gradient(to right, #14b8a6, #06b6d4)"
        glow="rgba(20,184,166,0.15)"
      />
      <StyleBar
        value={writingStyle.verbosity}
        leftLabel="Concise"
        rightLabel="Verbose"
        gradient="linear-gradient(to right, #f59e0b, #f97316)"
        glow="rgba(245,158,11,0.15)"
      />
    </div>
  );
}

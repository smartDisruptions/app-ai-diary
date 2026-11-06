'use client';

import React from 'react';
import type { WritingStyle } from '@/types';

/** Where your writing sits between two ends, marked by a firefly on a line. Neither end is better. */
function StyleLine({ value, leftLabel, rightLabel }: { value: number; leftLabel: string; rightLabel: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="grid gap-2">
      <div className="flex justify-between text-[12px] text-[var(--cream-soft)]">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div
        className="relative h-[2px] rounded-full"
        style={{ background: 'linear-gradient(90deg, rgba(244,230,204,0.12), rgba(244,230,204,0.3), rgba(244,230,204,0.12))' }}
        role="meter"
        aria-label={`${leftLabel} to ${rightLabel}`}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          aria-hidden="true"
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pct}%` }}
        >
          <circle cx="12" cy="12" r="11" fill="url(#sd-fly)" />
          <circle cx="12" cy="12" r="2.6" fill="#fff7c2" />
        </svg>
      </div>
    </div>
  );
}

export function WritingStyleCard({ writingStyle }: { writingStyle: WritingStyle }) {
  return (
    <div className="grid gap-5">
      <StyleLine value={writingStyle.formality} leftLabel="Casual" rightLabel="Formal" />
      <StyleLine value={writingStyle.verbosity} leftLabel="Concise" rightLabel="Verbose" />
    </div>
  );
}

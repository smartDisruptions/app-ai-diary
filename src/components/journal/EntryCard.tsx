'use client';

import React from 'react';
import { formatRelativeDate } from '@/lib/utils/date';
import { paintFor } from '@/components/stream/StreamDefs';
import type { Tone } from '@/lib/stream';
import type { Entry } from '@/types';

interface EntryCardProps {
  entry: Entry;
  mood?: string;
  tone?: Tone;
  onTap: (entry: Entry) => void;
}

/** One entry in the list: its firefly, the day, the feeling, and the opening lines. */
export function EntryCard({ entry, mood, tone = 'unread', onTap }: EntryCardProps) {
  const preview = entry.content.length > 100 ? entry.content.slice(0, 100) + '...' : entry.content;

  return (
    <button
      type="button"
      onClick={() => onTap(entry)}
      className="panel flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-[rgba(244,230,204,0.08)] cursor-pointer"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className="mt-0.5 flex-none">
        <circle cx="12" cy="12" r="11" fill={paintFor(tone)} />
        <circle cx="12" cy="12" r="2.4" fill="#fff7c2" />
      </svg>
      <span className="min-w-0 flex-1">
        <span className="mb-1 flex items-baseline justify-between gap-3">
          <span className="text-[12px] font-semibold text-[var(--cream-soft)]">{formatRelativeDate(entry.date)}</span>
          {mood && (
            <span className={`font-serif text-[15px] italic ${tone === 'restless' ? 'text-calm-blue' : 'text-[#f7d6a3]'}`}>
              {mood}
            </span>
          )}
        </span>
        <span className="block text-[14px] leading-snug text-cream line-clamp-2">{preview}</span>
      </span>
    </button>
  );
}

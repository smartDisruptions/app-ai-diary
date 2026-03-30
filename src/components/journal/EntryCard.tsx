'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeDate } from '@/lib/utils/date';
import type { Entry } from '@/types';

interface EntryCardProps {
  entry: Entry;
  mood?: string;
  onTap: (entry: Entry) => void;
}

export function EntryCard({ entry, mood, onTap }: EntryCardProps) {
  const preview =
    entry.content.length > 100
      ? entry.content.slice(0, 100) + '...'
      : entry.content;

  return (
    <button
      type="button"
      onClick={() => onTap(entry)}
      className="w-full text-left px-4 py-3 rounded-xl transition-colors duration-200 cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(196,154,108,0.1)',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-text-muted text-xs">
          {formatRelativeDate(entry.date)}
        </span>
        {mood && (
          <Badge variant="outline" className="!text-[10px] !px-2 !py-0.5">
            {mood}
          </Badge>
        )}
      </div>
      <p className="text-text-body text-sm leading-snug line-clamp-2">
        {preview}
      </p>
    </button>
  );
}

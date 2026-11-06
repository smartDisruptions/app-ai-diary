'use client';

import React from 'react';
import { EntryCard } from './EntryCard';
import type { StreamFirefly } from '@/lib/stream';
import type { Entry } from '@/types';

interface EntryListProps {
  entries: Entry[];
  onTapEntry: (entry: Entry) => void;
  moods?: Record<string, StreamFirefly>;
}

export function EntryList({ entries, onTapEntry, moods }: EntryListProps) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-[14px] text-[var(--cream-soft)]">No entries yet. Start writing!</p>;
  }

  const sorted = [...entries].sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));

  return (
    <div className="grid gap-2.5">
      {sorted.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          mood={moods?.[entry.id]?.mood ?? undefined}
          tone={moods?.[entry.id]?.tone}
          onTap={onTapEntry}
        />
      ))}
    </div>
  );
}

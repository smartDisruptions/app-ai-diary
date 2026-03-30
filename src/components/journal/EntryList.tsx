'use client';

import React from 'react';
import { EntryCard } from './EntryCard';
import type { Entry } from '@/types';

interface EntryListProps {
  entries: Entry[];
  onTapEntry: (entry: Entry) => void;
}

export function EntryList({ entries, onTapEntry }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <p className="text-text-muted text-sm text-center py-8">
        No entries yet. Start writing!
      </p>
    );
  }

  // Sort newest first
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-3">
      {sorted.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onTap={onTapEntry} />
      ))}
    </div>
  );
}

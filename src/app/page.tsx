'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { nanoid } from 'nanoid';
import { EntryEditor } from '@/components/journal/EntryEditor';
import { EntryList } from '@/components/journal/EntryList';
import { TodoList } from '@/components/journal/TodoList';
import { BottomSheet } from '@/components/journal/BottomSheet';
import { StreamScene } from '@/components/stream/StreamScene';
import { EmberMark } from '@/components/stream/EmberMark';
import { CareCard } from '@/components/stream/CareCard';
import { getEntries, saveEntry } from '@/lib/storage/entries';
import { getTodos, toggleTodo } from '@/lib/storage/todos';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useToast } from '@/contexts/ToastContext';
import { useCompanionName, useHasApiKey, useProfile, useToday } from '@/hooks/useClientValues';
import { formatRelativeDate } from '@/lib/utils/date';
import { buildWeek, checkInFor, moodsByEntry, weekHeadline } from '@/lib/stream';
import type { Entry, Todo } from '@/types';

const DISMISS_KEY = 'diary-checkin-dismissed';

function readDismissed(): string | null {
  try {
    return window.localStorage.getItem(DISMISS_KEY);
  } catch {
    return null;
  }
}

function longDate(today: string): string {
  const [y, m, d] = today.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/** The Stream: this week's entries as fireflies on a riverbank at night. */
export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showEntries, setShowEntries] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const { triggerAnalysis, analyzing } = useAnalysis();
  const { showToast } = useToast();
  const today = useToday();
  const companion = useCompanionName();
  const aiOn = useHasApiKey();
  const { profile } = useProfile();

  const refreshEntries = useCallback(() => setEntries(getEntries()), []);
  const refreshTodos = useCallback(() => setTodos(getTodos()), []);

  useEffect(() => {
    refreshEntries();
    refreshTodos();
    setDismissedFor(readDismissed());
  }, [refreshEntries, refreshTodos]);

  const week = useMemo(() => (today ? buildWeek(entries, profile, today) : null), [entries, profile, today]);
  const moods = useMemo(() => moodsByEntry(entries, profile), [entries, profile]);
  const checkIn = today ? checkInFor(entries, profile, today, dismissedFor) : null;

  const handleSave = (content: string, date: string) => {
    const now = new Date().toISOString();
    if (editingEntry) {
      const updated: Entry = { ...editingEntry, content, updatedAt: now };
      saveEntry(updated);
      triggerAnalysis(updated);
      showToast('Entry updated', 'success');
    } else {
      const newEntry: Entry = { id: nanoid(), date, content, createdAt: now, updatedAt: now };
      saveEntry(newEntry);
      triggerAnalysis(newEntry);
      showToast('Added to the stream', 'success');
    }
    setEditingEntry(null);
    setShowEditor(false);
    refreshEntries();
  };

  const openEntry = (id: string) => {
    const found = entries.find((e) => e.id === id);
    if (!found) return;
    setEditingEntry(found);
    setShowEntries(false);
    setShowEditor(true);
  };

  const dismissCheckIn = () => {
    if (!checkIn) return;
    try {
      window.localStorage.setItem(DISMISS_KEY, checkIn.entryId);
    } catch {
      /* storage blocked: it stays dismissed for this visit */
    }
    setDismissedFor(checkIn.entryId);
  };

  const latest = [...entries].sort((a, b) => b.date.localeCompare(a.date))[0];

  let note: React.ReactNode;
  if (!aiOn) {
    note = (
      <>
        <b className="text-gold">{companion}</b> can notice how your days feel and point out patterns.{' '}
        <Link href="/settings" className="underline decoration-[rgba(242,181,94,0.5)] underline-offset-2">
          Add an AI key in Settings
        </Link>{' '}
        to turn that on.
      </>
    );
  } else if (profile?.observation) {
    note = (
      <>
        <b className="text-gold">{companion}</b> noticed {profile.observation}
      </>
    );
  } else if (profile) {
    note = (
      <>
        <b className="text-gold">{companion}</b> noticed you’ve been feeling {profile.emotions.recentMood.toLowerCase()} lately.
      </>
    );
  } else {
    note = (
      <>
        <b className="text-gold">{companion}</b> reads each entry to learn how your days feel. Write tonight and it will
        start noticing patterns.
      </>
    );
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6 px-5 pt-[calc(28px+env(safe-area-inset-top,0px))] md:px-8 md:pt-12 pb-tabbar">
      <header className="grid gap-2">
        <p className="eyebrow">{today ? longDate(today) : ' '}</p>
        <h1 className="display text-[40px] md:text-[48px]">{week ? weekHeadline(week) : ' '}</h1>
      </header>

      {week ? <StreamScene days={week} onOpenEntry={openEntry} /> : <div className="aspect-[336/196] w-full" />}

      {checkIn && <CareCard checkIn={checkIn} companionName={companion} onDismiss={dismissCheckIn} />}

      <button
        type="button"
        className="glow-button"
        onClick={() => {
          setEditingEntry(null);
          setShowEditor(true);
        }}
      >
        <span>
          Write by the water
          <small>How was today?</small>
        </span>
        <span aria-hidden="true" className="text-[20px]">
          →
        </span>
      </button>

      {!checkIn && (
        <div className="panel flex items-start gap-3 px-4 py-3.5 text-[14px] leading-relaxed">
          <EmberMark size={30} blink={analyzing} />
          <p className="min-w-0">
            {note}
            {analyzing && <span className="mt-1 block text-[12px] text-[var(--cream-soft)]">Reading your entry…</span>}
          </p>
        </div>
      )}

      {todos.length > 0 && <TodoList todos={todos} onToggle={(id) => { toggleTodo(id); refreshTodos(); }} />}

      <button
        type="button"
        onClick={() => setShowEntries(true)}
        className="panel flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-[rgba(244,230,204,0.08)] cursor-pointer"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-cream">Your entries</span>
          <span className="mt-0.5 block text-[12.5px] text-[var(--cream-soft)]">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} ·{' '}
            {latest ? `last written ${formatRelativeDate(latest.date).toLowerCase()}` : 'none yet'}
          </span>
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-[var(--cream-faint)]">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <BottomSheet isOpen={showEntries} onClose={() => setShowEntries(false)}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-[28px]">Your entries</h2>
          <button type="button" onClick={() => setShowEntries(false)} className="min-h-[44px] px-2 text-[14px] text-[var(--cream-soft)] cursor-pointer">
            Close
          </button>
        </div>
        <EntryList
          entries={entries}
          moods={moods}
          onTapEntry={(entry) => openEntry(entry.id)}
        />
      </BottomSheet>

      <EntryEditor
        isOpen={showEditor}
        onClose={() => {
          setEditingEntry(null);
          setShowEditor(false);
        }}
        onSave={handleSave}
        editingEntry={editingEntry}
      />
    </div>
  );
}

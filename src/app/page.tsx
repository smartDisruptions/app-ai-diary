'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { EntryEditor } from '@/components/journal/EntryEditor';
import { EntryList } from '@/components/journal/EntryList';
import { TodoList } from '@/components/journal/TodoList';
import { BottomSheet } from '@/components/journal/BottomSheet';
import { getEntries, saveEntry } from '@/lib/storage/entries';
import { getTodos, toggleTodo } from '@/lib/storage/todos';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useToast } from '@/contexts/ToastContext';
import { getTodayString, formatRelativeDate } from '@/lib/utils/date';
import type { Entry, Todo } from '@/types';

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showEntries, setShowEntries] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const { triggerAnalysis } = useAnalysis();
  const { showToast } = useToast();

  const refreshEntries = useCallback(() => {
    setEntries(getEntries());
  }, []);

  const refreshTodos = useCallback(() => {
    setTodos(getTodos());
  }, []);

  useEffect(() => {
    refreshEntries();
    refreshTodos();
  }, [refreshEntries, refreshTodos]);

  const handleSave = (content: string, date: string) => {
    const now = new Date().toISOString();

    if (editingEntry) {
      const updated: Entry = {
        ...editingEntry,
        content,
        updatedAt: now,
      };
      saveEntry(updated);
      triggerAnalysis(updated);
      showToast('Entry updated', 'success');
    } else {
      const newEntry: Entry = {
        id: nanoid(),
        date,
        content,
        createdAt: now,
        updatedAt: now,
      };
      saveEntry(newEntry);
      triggerAnalysis(newEntry);
      showToast('Entry saved', 'success');
    }

    setEditingEntry(null);
    setShowEditor(false);
    refreshEntries();
  };

  const handleToggleTodo = (id: string) => {
    toggleTodo(id);
    refreshTodos();
  };

  const handleTapEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setShowEntries(false);
    setShowEditor(true);
  };

  const handleOpenEditor = () => {
    setEditingEntry(null);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setEditingEntry(null);
    setShowEditor(false);
  };

  // Date greeting
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  // Last written info
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const lastEntry = sorted[0];
  const lastWrittenLabel = lastEntry
    ? `Last written ${formatRelativeDate(lastEntry.date).toLowerCase()}`
    : 'No entries yet';

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 pb-28 space-y-8">
      {/* 1. Header */}
      <header>
        <p className="text-text-muted text-sm">
          {dayName}, {monthDay}
        </p>
        <h1 className="text-copper text-2xl font-bold mt-1">Your Journal</h1>
      </header>

      {/* 2. Write prompt */}
      <button
        type="button"
        onClick={handleOpenEditor}
        className="w-full rounded-2xl p-5 text-left cursor-pointer transition-colors duration-200"
        style={{
          border: '1.5px dashed rgba(196, 154, 108, 0.2)',
          background: 'rgba(196, 154, 108, 0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Pen icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0 text-copper"
          >
            <path
              d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-text-muted text-sm">How was your day?</span>
        </div>
      </button>

      {/* 3. Todos section */}
      <TodoList todos={todos} onToggle={handleToggleTodo} />

      {/* 4. Recent Entries button */}
      <button
        type="button"
        onClick={() => setShowEntries(true)}
        className="w-full rounded-2xl p-4 text-left cursor-pointer transition-colors duration-200"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(196,154,108,0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Book icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0 text-copper"
          >
            <path
              d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="flex-1 min-w-0">
            <p className="text-text-body text-sm font-medium">Recent Entries</p>
            <p className="text-text-muted text-xs mt-0.5">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} &middot;{' '}
              {lastWrittenLabel}
            </p>
          </div>

          {/* Chevron */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0 text-text-muted"
          >
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* 5. Bottom sheet for entries */}
      <BottomSheet isOpen={showEntries} onClose={() => setShowEntries(false)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-heading text-lg font-semibold">
            Recent Entries
          </h2>
          <button
            type="button"
            onClick={() => setShowEntries(false)}
            className="text-text-muted text-sm cursor-pointer"
          >
            Close
          </button>
        </div>
        <EntryList entries={entries} onTapEntry={handleTapEntry} />
      </BottomSheet>

      {/* Full-screen entry editor */}
      <EntryEditor
        isOpen={showEditor}
        onClose={handleCloseEditor}
        onSave={handleSave}
        editingEntry={editingEntry}
      />
    </div>
  );
}

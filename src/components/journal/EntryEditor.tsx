'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { formatDate, getTodayString } from '@/lib/utils/date';
import type { Entry } from '@/types';

interface EntryEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, date: string) => void;
  editingEntry?: Entry | null;
}

export function EntryEditor({
  isOpen,
  onClose,
  onSave,
  editingEntry,
}: EntryEditorProps) {
  const [content, setContent] = useState('');
  const today = getTodayString();

  useEffect(() => {
    if (isOpen) {
      setContent(editingEntry ? editingEntry.content : '');
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, editingEntry]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handleSave = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSave(trimmed, editingEntry ? editingEntry.date : today);
    setContent('');
  };

  if (!isOpen) return null;

  const dateStr = editingEntry ? formatDate(editingEntry.date) : formatDate(today);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#141416' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="text-text-muted text-sm font-medium cursor-pointer"
        >
          Cancel
        </button>
        <p className="text-text-muted text-sm">{dateStr}</p>
        <Button
          variant="primary"
          className="!px-4 !py-1.5 text-sm"
          onClick={handleSave}
          disabled={!content.trim()}
        >
          {editingEntry ? 'Update' : 'Save'}
        </Button>
      </div>

      {/* Textarea */}
      <div className="flex-1 px-6 pb-8">
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write about your day..."
          className="w-full h-full bg-transparent text-text-body text-base leading-relaxed resize-none placeholder:text-text-muted focus:outline-none"
        />
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { formatDate, getTodayString } from '@/lib/utils/date';
import { useCompanionName, useHasApiKey } from '@/hooks/useClientValues';
import type { Entry } from '@/types';

interface EntryEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, date: string) => void;
  editingEntry?: Entry | null;
}

/**
 * The writing page: a quiet dark sheet with serif type, and a firefly that
 * glows brighter the more you write. It says plainly where the entry goes.
 */
export function EntryEditor({ isOpen, onClose, onSave, editingEntry }: EntryEditorProps) {
  const [content, setContent] = useState('');
  const today = getTodayString();
  const companion = useCompanionName();
  const aiOn = useHasApiKey();

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
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const handleSave = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSave(trimmed, editingEntry ? editingEntry.date : today);
    setContent('');
  };

  if (!isOpen) return null;

  const dateStr = editingEntry ? formatDate(editingEntry.date) : formatDate(today);
  // The firefly brightens as the entry grows, topping out around 600 characters.
  const glow = 0.35 + Math.min(1, content.length / 600) * 0.65;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #19141c, #0e0c10)' }}
      role="dialog"
      aria-modal="true"
      aria-label={editingEntry ? 'Edit entry' : 'New entry'}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 md:px-8 pt-[calc(14px+env(safe-area-inset-top,0px))]">
        <div className="flex items-center justify-between py-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-1 text-[15px] font-medium text-[var(--cream-soft)] cursor-pointer"
          >
            Cancel
          </button>
          <Button className="!rounded-full !px-5 text-[14px]" onClick={handleSave} disabled={!content.trim()}>
            {editingEntry ? 'Update' : 'Add to the stream'}
          </Button>
        </div>

        <p className="eyebrow mt-3">{dateStr}</p>
        {!editingEntry && (
          <p className="mt-2 font-serif text-[26px] font-semibold italic text-[var(--cream-soft)]">How was today?</p>
        )}

        <div className="relative mt-3 flex-1">
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write about your day..."
            className="h-full min-h-[40vh] w-full resize-none bg-transparent font-serif text-[21px] font-semibold leading-[1.45] text-cream placeholder:text-[rgba(244,230,204,0.3)] focus:outline-none"
          />
          <svg
            viewBox="0 0 48 48"
            width="48"
            height="48"
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 right-0"
            style={{ opacity: glow, transition: 'opacity 400ms ease' }}
          >
            <circle className="firefly-blink" cx="24" cy="24" r="22" fill="url(#sd-fly)" />
            <circle cx="24" cy="24" r="4" fill="#fff7c2" />
          </svg>
        </div>

        <p className="border-t border-[var(--line)] pt-3 pb-[calc(16px+env(safe-area-inset-bottom,0px))] text-[12.5px] leading-relaxed text-[var(--cream-soft)]">
          {aiOn
            ? `Saved on this phone. ${companion} sends it to the AI model in Settings to notice your mood and patterns.`
            : 'Saved on this phone only. Turn on the AI in Settings to see moods and patterns.'}
        </p>
      </div>
    </div>
  );
}

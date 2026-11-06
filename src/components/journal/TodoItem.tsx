'use client';

import React from 'react';
import type { Todo } from '@/types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
}

export function TodoItem({ todo, onToggle }: TodoItemProps) {
  const createdDate = new Date(todo.createdAt);
  const dateLabel = createdDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <button
      type="button"
      onClick={() => onToggle(todo.id)}
      className="flex items-start gap-3 w-full text-left py-2.5 min-h-[44px] cursor-pointer"
    >
      {/* Checkbox */}
      <div className="mt-0.5 flex-shrink-0">
        {todo.done ? (
          <div className="w-5 h-5 rounded-md bg-gradient-to-b from-[#f4c578] to-[#e19a3f] flex items-center justify-center">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 6L5 8.5L9.5 3.5"
                stroke="#2a1709"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <div
            className="w-5 h-5 rounded-md"
            style={{ border: '1.5px solid rgba(244, 230, 204, 0.35)' }}
          />
        )}
      </div>

      {/* Text + source */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            todo.done
              ? 'line-through text-[var(--cream-faint)]'
              : 'text-cream'
          }`}
        >
          {todo.text}
        </p>
        <p className="text-xs text-[var(--cream-faint)] mt-0.5">
          {todo.source} &middot; {dateLabel}
        </p>
      </div>
    </button>
  );
}

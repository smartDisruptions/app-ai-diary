'use client';

import React from 'react';
import { TodoItem } from './TodoItem';
import type { Todo } from '@/types';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
}

export function TodoList({ todos, onToggle }: TodoListProps) {
  const openCount = todos.filter((t) => !t.done).length;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-text-heading tracking-wide">
          Your todos
        </h2>
        {openCount > 0 && (
          <span className="bg-gradient-to-r from-copper to-copper-deep text-bg-primary rounded-full px-2 py-0.5 text-[10px] font-bold leading-none">
            {openCount}
          </span>
        )}
      </div>

      {todos.length === 0 ? (
        <p className="text-text-muted text-sm py-4">
          No todos yet — mention tasks in chat
        </p>
      ) : (
        <div className="divide-y divide-[rgba(196,154,108,0.08)]">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
          ))}
        </div>
      )}
    </section>
  );
}

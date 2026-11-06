'use client';

import React from 'react';
import { TodoItem } from './TodoItem';
import type { Todo } from '@/types';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
}

/** Things to do that came up in chat. */
export function TodoList({ todos, onToggle }: TodoListProps) {
  const openCount = todos.filter((t) => !t.done).length;

  return (
    <section className="panel px-4 pt-3.5 pb-2" aria-labelledby="todos-title">
      <div className="mb-1 flex items-center gap-2">
        <h2 id="todos-title" className="section-label">
          To-dos
        </h2>
        {openCount > 0 && (
          <span className="rounded-full bg-[rgba(242,181,94,0.18)] px-2 py-0.5 text-[11px] font-bold leading-none text-gold">
            {openCount}
          </span>
        )}
      </div>
      {todos.length === 0 ? (
        <p className="py-3 text-[14px] text-[var(--cream-soft)]">Nothing yet. Mention a task in chat and it will show up here.</p>
      ) : (
        <div className="divide-y divide-[var(--line)]">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
          ))}
        </div>
      )}
    </section>
  );
}

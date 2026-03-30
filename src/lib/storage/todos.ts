import type { Todo } from '@/types';

const KEY = 'diary-todos';

export function getTodos(): Todo[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(todos));
}

export function addTodo(todo: Todo): void {
  const todos = getTodos();
  todos.unshift(todo);
  saveTodos(todos);
}

export function toggleTodo(id: string): void {
  const todos = getTodos();
  const idx = todos.findIndex((t) => t.id === id);
  if (idx !== -1) {
    todos[idx].done = !todos[idx].done;
    saveTodos(todos);
  }
}

export function deleteTodo(id: string): void {
  const todos = getTodos().filter((t) => t.id !== id);
  saveTodos(todos);
}

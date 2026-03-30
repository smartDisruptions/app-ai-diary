import type { Message } from '@/types';

const STORAGE_KEY = 'diary-companion-history';
const MAX_MESSAGES = 50;

export function getMessages(): Message[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addMessage(msg: Message): void {
  const messages = getMessages();
  messages.push(msg);
  const pruned = messages.slice(-MAX_MESSAGES);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
}

export function clearMessages(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

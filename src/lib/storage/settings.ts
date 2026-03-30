import type { Settings } from '@/types';

const STORAGE_KEY = 'diary-settings';

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: 'anthropic/claude-sonnet-4',
  userName: '',
};

export function getSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

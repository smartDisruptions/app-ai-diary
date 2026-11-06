import type { Settings } from '@/types';

const STORAGE_KEY = 'diary-settings';

export const DEFAULT_COMPANION_NAME = 'Ember';

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: 'anthropic/claude-sonnet-4',
  userName: '',
  companionName: DEFAULT_COMPANION_NAME,
};

/** The companion's name, never blank. */
export function companionNameOf(settings: Partial<Settings> | null | undefined): string {
  const name = settings?.companionName?.trim();
  return name ? name : DEFAULT_COMPANION_NAME;
}

/** Fired after settings are saved, so the name in the tab bar updates at once. */
export const SETTINGS_EVENT = 'diary-settings-changed';

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
  try {
    window.dispatchEvent(new Event(SETTINGS_EVENT));
  } catch {
    /* no window events (tests, old browsers): the name updates on next load */
  }
}

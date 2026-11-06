'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { getTodayString } from '@/lib/utils/date';
import { PROFILE_EVENT, PROFILE_KEY, getProfile } from '@/lib/storage/profile';
import type { PersonalityProfile } from '@/types';
import {
  DEFAULT_COMPANION_NAME,
  SETTINGS_EVENT,
  companionNameOf,
  getSettings,
} from '@/lib/storage/settings';

/**
 * Values that only exist in the browser (today's date in the reader's own
 * timezone, what they named their companion). Read through
 * useSyncExternalStore so the server render and the first browser render
 * agree, and the real value arrives right after: no hydration mismatch.
 */

const noop = () => () => {};

/** Today as YYYY-MM-DD in the reader's timezone; null while server-rendering. */
export function useToday(): string | null {
  return useSyncExternalStore(noop, getTodayString, () => null);
}

function subscribeSettings(onChange: () => void) {
  window.addEventListener(SETTINGS_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(SETTINGS_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** What the companion is called. Ember until the person renames it. */
export function useCompanionName(): string {
  return useSyncExternalStore(
    subscribeSettings,
    () => companionNameOf(getSettings()),
    () => DEFAULT_COMPANION_NAME,
  );
}

/** Whether the AI is switched on (an API key is saved). */
export function useHasApiKey(): boolean {
  return useSyncExternalStore(
    subscribeSettings,
    () => Boolean(getSettings().apiKey),
    () => false,
  );
}

function subscribeProfile(onChange: () => void) {
  window.addEventListener(PROFILE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(PROFILE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function readProfileRaw(): string | null {
  try {
    return window.localStorage.getItem(PROFILE_KEY);
  } catch {
    return null;
  }
}

/**
 * The AI's profile, kept current: when an analysis finishes and saves, every
 * open screen re-reads it (so a new entry's firefly takes its colour on its
 * own). `ready` is false only during the server render.
 */
export function useProfile(): { profile: PersonalityProfile | null; ready: boolean } {
  const raw = useSyncExternalStore<string | null | undefined>(subscribeProfile, readProfileRaw, () => undefined);
  const profile = useMemo(() => (raw === undefined ? null : getProfile()), [raw]);
  return { profile, ready: raw !== undefined };
}

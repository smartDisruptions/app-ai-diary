import type { PersonalityProfile } from '@/types';

export const PROFILE_KEY = 'diary-profile';
const STORAGE_KEY = PROFILE_KEY;

/** Fired after the AI saves a new profile, so open screens update on their own. */
export const PROFILE_EVENT = 'diary-profile-changed';

export function getProfile(): PersonalityProfile | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersonalityProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: PersonalityProfile): void {
  const pruned: PersonalityProfile = {
    ...profile,
    emotions: {
      ...profile.emotions,
      moodHistory: profile.emotions.moodHistory.slice(-90),
    },
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
  try {
    window.dispatchEvent(new Event(PROFILE_EVENT));
  } catch {
    /* no window events: screens pick it up on next load */
  }
}

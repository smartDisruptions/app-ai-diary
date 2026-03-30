import type { PersonalityProfile } from '@/types';

const STORAGE_KEY = 'diary-profile';

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
}

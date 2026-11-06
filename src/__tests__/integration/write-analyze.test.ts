import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveEntry, getEntries } from '@/lib/storage/entries';
import { getProfile, saveProfile } from '@/lib/storage/profile';
import { analyzeEntry } from '@/lib/ai/analysis';
import type { PersonalityProfile, Entry } from '@/types';

vi.mock('@/lib/api/openrouter', () => ({
  chatCompletion: vi.fn(),
}));

const { chatCompletion } = await import('@/lib/api/openrouter');
const mockedChat = vi.mocked(chatCompletion);

const mockProfileResponse: PersonalityProfile = {
  emotions: {
    patterns: ['excitement', 'gratitude'],
    recentMood: 'excited',
    moodHistory: [{ date: '2026-03-30', mood: 'excited', valence: 0.9 }],
  },
  bigFive: { openness: 72, conscientiousness: 58, extraversion: 50, agreeableness: 77, neuroticism: 28 },
  writingStyle: { formality: 35, verbosity: 50, topTopics: ['coding', 'nature'], vocabularyLevel: 'conversational' },
  lastUpdated: '2026-03-30T10:00:00Z',
  entryCount: 1,
};

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('write → analyze → profile update flow', () => {
  it('saves an entry and updates profile after analysis', async () => {
    const entry: Entry = {
      id: 'int-test-1',
      date: '2026-03-30',
      content: 'Built an amazing app today! Feeling accomplished and grateful.',
      createdAt: '2026-03-30T10:00:00Z',
      updatedAt: '2026-03-30T10:00:00Z',
    };

    // Save entry
    saveEntry(entry);
    const entries = getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].content).toContain('amazing app');

    // No profile yet
    expect(getProfile()).toBeNull();

    // Simulate analysis
    mockedChat.mockResolvedValueOnce(JSON.stringify(mockProfileResponse));
    const settings = { apiKey: 'sk-test', model: 'test-model', userName: 'Josh', companionName: 'Ember' };
    const profile = await analyzeEntry(null, entry, settings);

    // Save profile
    saveProfile(profile);

    // Verify profile persisted
    const savedProfile = getProfile();
    expect(savedProfile).not.toBeNull();
    expect(savedProfile!.emotions.recentMood).toBe('excited');
    expect(savedProfile!.bigFive.openness).toBe(72);
    expect(savedProfile!.entryCount).toBe(1);
  });

  it('incremental update preserves and extends profile', async () => {
    // Set up existing profile
    saveProfile(mockProfileResponse);

    const newEntry: Entry = {
      id: 'int-test-2',
      date: '2026-03-31',
      content: 'Quiet day reading and reflecting.',
      createdAt: '2026-03-31T10:00:00Z',
      updatedAt: '2026-03-31T10:00:00Z',
    };

    const updatedProfile: PersonalityProfile = {
      ...mockProfileResponse,
      emotions: {
        ...mockProfileResponse.emotions,
        recentMood: 'reflective',
        moodHistory: [
          ...mockProfileResponse.emotions.moodHistory,
          { date: '2026-03-31', mood: 'reflective', valence: 0.3 },
        ],
      },
      entryCount: 2,
    };

    mockedChat.mockResolvedValueOnce(JSON.stringify(updatedProfile));
    const settings = { apiKey: 'sk-test', model: 'test-model', userName: 'Josh', companionName: 'Ember' };
    const result = await analyzeEntry(getProfile(), newEntry, settings);
    saveProfile(result);

    const saved = getProfile();
    expect(saved!.entryCount).toBe(2);
    expect(saved!.emotions.recentMood).toBe('reflective');
    expect(saved!.emotions.moodHistory).toHaveLength(2);
  });
});

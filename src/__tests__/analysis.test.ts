import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeEntry, fullRecompute } from '@/lib/ai/analysis';
import type { PersonalityProfile, Entry, Settings } from '@/types';

const validProfileJSON: PersonalityProfile = {
  emotions: {
    patterns: ['optimism'],
    recentMood: 'happy',
    moodHistory: [{ date: '2026-03-30', mood: 'happy', valence: 0.8 }],
  },
  bigFive: { openness: 70, conscientiousness: 60, extraversion: 50, agreeableness: 75, neuroticism: 25 },
  writingStyle: { formality: 35, verbosity: 50, topTopics: ['hiking'], vocabularyLevel: 'conversational' },
  lastUpdated: '2026-03-30T10:00:00Z',
  entryCount: 1,
};

const mockEntry: Entry = {
  id: 'test-1',
  date: '2026-03-30',
  content: 'Great day hiking.',
  createdAt: '2026-03-30T10:00:00Z',
  updatedAt: '2026-03-30T10:00:00Z',
};

const mockSettings: Settings = { apiKey: 'sk-test', model: 'test-model', userName: 'Josh', companionName: 'Ember' };

vi.mock('@/lib/api/openrouter', () => ({
  chatCompletion: vi.fn(),
}));

const { chatCompletion } = await import('@/lib/api/openrouter');
const mockedChat = vi.mocked(chatCompletion);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('analyzeEntry', () => {
  it('returns validated profile on success', async () => {
    mockedChat.mockResolvedValueOnce(JSON.stringify(validProfileJSON));
    const result = await analyzeEntry(null, mockEntry, mockSettings);
    expect(result.bigFive.openness).toBe(70);
    expect(result.entryCount).toBe(1);
  });

  it('retries once on parse failure then succeeds', async () => {
    mockedChat
      .mockResolvedValueOnce('not valid json')
      .mockResolvedValueOnce(JSON.stringify(validProfileJSON));

    const result = await analyzeEntry(null, mockEntry, mockSettings);
    expect(mockedChat).toHaveBeenCalledTimes(2);
    expect(result.entryCount).toBe(1);
  });

  it('throws after two parse failures', async () => {
    mockedChat
      .mockResolvedValueOnce('bad')
      .mockResolvedValueOnce('also bad');

    await expect(analyzeEntry(null, mockEntry, mockSettings)).rejects.toThrow();
  });

  it('handles markdown-wrapped JSON response', async () => {
    mockedChat.mockResolvedValueOnce('```json\n' + JSON.stringify(validProfileJSON) + '\n```');
    const result = await analyzeEntry(null, mockEntry, mockSettings);
    expect(result.entryCount).toBe(1);
  });
});

describe('fullRecompute', () => {
  it('sends up to 50 entries', async () => {
    mockedChat.mockResolvedValueOnce(JSON.stringify({ ...validProfileJSON, entryCount: 50 }));

    const entries = Array.from({ length: 60 }, (_, i) => ({
      ...mockEntry,
      id: `entry-${i}`,
      date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    }));

    const result = await fullRecompute(entries, mockSettings);
    expect(result.entryCount).toBe(50);
    // Verify the prompt only includes 50 entries
    const callArgs = mockedChat.mock.calls[0][0];
    const userMsg = callArgs.find((m) => m.role === 'user')!;
    expect(userMsg.content).toContain('50 journal entries');
  });
});

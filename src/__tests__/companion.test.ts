import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendCompanionMessage } from '@/lib/ai/companion';
import type { PersonalityProfile, Message, Settings } from '@/types';

const mockProfile: PersonalityProfile = {
  emotions: {
    patterns: ['optimism', 'curiosity'],
    recentMood: 'content',
    moodHistory: [{ date: '2026-03-29', mood: 'happy', valence: 0.8 }],
  },
  bigFive: { openness: 75, conscientiousness: 60, extraversion: 45, agreeableness: 80, neuroticism: 30 },
  writingStyle: { formality: 40, verbosity: 55, topTopics: ['technology'], vocabularyLevel: 'conversational' },
  lastUpdated: '2026-03-29T10:00:00Z',
  entryCount: 10,
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

describe('sendCompanionMessage', () => {
  it('returns assistant response', async () => {
    mockedChat.mockResolvedValueOnce('Hello! How was your day?');
    const messages: Message[] = [
      { role: 'user', content: 'Hi there!', timestamp: '2026-03-30T10:00:00Z' },
    ];
    const result = await sendCompanionMessage(messages, mockProfile, mockSettings);
    expect(result).toBe('Hello! How was your day?');
  });

  it('includes profile data in system prompt', async () => {
    mockedChat.mockResolvedValueOnce('response');
    const messages: Message[] = [
      { role: 'user', content: 'Hello', timestamp: '2026-03-30T10:00:00Z' },
    ];
    await sendCompanionMessage(messages, mockProfile, mockSettings);

    const callArgs = mockedChat.mock.calls[0][0];
    const systemMsg = callArgs[0];
    expect(systemMsg.role).toBe('system');
    expect(systemMsg.content).toContain('formality level 40/100');
    expect(systemMsg.content).toContain('technology');
    expect(systemMsg.content).toContain('Josh');
  });

  it('sends only last 20 messages from history', async () => {
    mockedChat.mockResolvedValueOnce('response');
    const messages: Message[] = Array.from({ length: 30 }, (_, i) => ({
      role: 'user' as const,
      content: `Message ${i}`,
      timestamp: new Date(2026, 2, 30, 10, i).toISOString(),
    }));

    await sendCompanionMessage(messages, mockProfile, mockSettings);
    const callArgs = mockedChat.mock.calls[0][0];
    // system + 20 history messages
    expect(callArgs).toHaveLength(21);
  });

  it('works without profile', async () => {
    mockedChat.mockResolvedValueOnce('Welcome!');
    const messages: Message[] = [
      { role: 'user', content: 'Hi', timestamp: '2026-03-30T10:00:00Z' },
    ];
    const result = await sendCompanionMessage(messages, null, mockSettings);
    expect(result).toBe('Welcome!');

    const systemMsg = mockedChat.mock.calls[0][0][0];
    expect(systemMsg.content).toContain("hasn't written enough");
  });
});

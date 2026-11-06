import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addMessage, getMessages, clearMessages } from '@/lib/storage/companion';
import { saveProfile } from '@/lib/storage/profile';
import { sendCompanionMessage } from '@/lib/ai/companion';
import type { PersonalityProfile, Message } from '@/types';

vi.mock('@/lib/api/openrouter', () => ({
  chatCompletion: vi.fn(),
}));

const { chatCompletion } = await import('@/lib/api/openrouter');
const mockedChat = vi.mocked(chatCompletion);

const mockProfile: PersonalityProfile = {
  emotions: {
    patterns: ['optimism'],
    recentMood: 'happy',
    moodHistory: [{ date: '2026-03-30', mood: 'happy', valence: 0.8 }],
  },
  bigFive: { openness: 70, conscientiousness: 60, extraversion: 50, agreeableness: 75, neuroticism: 25 },
  writingStyle: { formality: 30, verbosity: 45, topTopics: ['coding'], vocabularyLevel: 'conversational' },
  lastUpdated: '2026-03-30T10:00:00Z',
  entryCount: 10,
};

const settings = { apiKey: 'sk-test', model: 'test-model', userName: 'Josh', companionName: 'Ember' };

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe('chat flow', () => {
  it('sends message and receives personality-adapted response', async () => {
    saveProfile(mockProfile);

    const userMsg: Message = {
      role: 'user',
      content: 'How are you today?',
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);

    mockedChat.mockResolvedValueOnce("Hey Josh! I'm doing great. Been coding anything fun lately?");

    const response = await sendCompanionMessage(getMessages(), mockProfile, settings);

    expect(response).toContain('Josh');

    // Verify system prompt included profile data
    const systemMsg = mockedChat.mock.calls[0][0][0];
    expect(systemMsg.content).toContain('formality level 30/100');
    expect(systemMsg.content).toContain('coding');
    expect(systemMsg.content).toContain('reference patterns');
  });

  it('chat history persists across messages', () => {
    const msg1: Message = { role: 'user', content: 'Hello', timestamp: '2026-03-30T10:00:00Z' };
    const msg2: Message = { role: 'assistant', content: 'Hi there!', timestamp: '2026-03-30T10:00:01Z' };
    const msg3: Message = { role: 'user', content: 'How are you?', timestamp: '2026-03-30T10:00:02Z' };

    addMessage(msg1);
    addMessage(msg2);
    addMessage(msg3);

    const messages = getMessages();
    expect(messages).toHaveLength(3);
    expect(messages[0].content).toBe('Hello');
    expect(messages[2].content).toBe('How are you?');
  });

  it('clear chat removes all messages', () => {
    addMessage({ role: 'user', content: 'test', timestamp: '2026-03-30T10:00:00Z' });
    expect(getMessages()).toHaveLength(1);

    clearMessages();
    expect(getMessages()).toHaveLength(0);
  });
});

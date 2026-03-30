import { describe, it, expect } from 'vitest';
import { personalityProfileSchema, entrySchema, messageSchema, settingsSchema } from '@/schemas';

const validProfile = {
  emotions: {
    patterns: ['optimism', 'curiosity'],
    recentMood: 'content',
    moodHistory: [
      { date: '2026-03-29', mood: 'happy', valence: 0.8 },
    ],
  },
  bigFive: {
    openness: 75,
    conscientiousness: 60,
    extraversion: 45,
    agreeableness: 80,
    neuroticism: 30,
  },
  writingStyle: {
    formality: 40,
    verbosity: 55,
    topTopics: ['technology', 'travel'],
    vocabularyLevel: 'conversational',
  },
  lastUpdated: '2026-03-29T10:00:00Z',
  entryCount: 5,
};

describe('personalityProfileSchema', () => {
  it('accepts a valid profile', () => {
    const result = personalityProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('rejects bigFive scores out of range', () => {
    const bad = { ...validProfile, bigFive: { ...validProfile.bigFive, openness: 150 } };
    const result = personalityProfileSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('rejects missing emotions field', () => {
    const { emotions, ...rest } = validProfile;
    const result = personalityProfileSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects negative entryCount', () => {
    const bad = { ...validProfile, entryCount: -1 };
    const result = personalityProfileSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('rejects valence outside -1 to 1', () => {
    const bad = {
      ...validProfile,
      emotions: {
        ...validProfile.emotions,
        moodHistory: [{ date: '2026-03-29', mood: 'happy', valence: 2.5 }],
      },
    };
    const result = personalityProfileSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});

describe('entrySchema', () => {
  it('accepts a valid entry', () => {
    const result = entrySchema.safeParse({
      id: 'abc123',
      date: '2026-03-29',
      content: 'Today was great.',
      createdAt: '2026-03-29T10:00:00Z',
      updatedAt: '2026-03-29T10:00:00Z',
    });
    expect(result.success).toBe(true);
  });
});

describe('messageSchema', () => {
  it('accepts valid user message', () => {
    const result = messageSchema.safeParse({
      role: 'user',
      content: 'Hello!',
      timestamp: '2026-03-29T10:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid role', () => {
    const result = messageSchema.safeParse({
      role: 'system',
      content: 'test',
      timestamp: '2026-03-29T10:00:00Z',
    });
    expect(result.success).toBe(false);
  });
});

describe('settingsSchema', () => {
  it('accepts valid settings', () => {
    const result = settingsSchema.safeParse({
      apiKey: 'sk-or-123',
      model: 'anthropic/claude-sonnet-4',
      userName: 'Josh',
    });
    expect(result.success).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { buildAnalysisPrompt, buildFullRecomputePrompt, buildCompanionSystemPrompt } from '@/lib/ai/prompts';
import type { PersonalityProfile, Entry, Settings } from '@/types';

const mockProfile: PersonalityProfile = {
  emotions: {
    patterns: ['optimism', 'curiosity'],
    recentMood: 'content',
    moodHistory: [{ date: '2026-03-29', mood: 'happy', valence: 0.8 }],
  },
  bigFive: { openness: 75, conscientiousness: 60, extraversion: 45, agreeableness: 80, neuroticism: 30 },
  writingStyle: { formality: 40, verbosity: 55, topTopics: ['technology', 'travel'], vocabularyLevel: 'conversational' },
  lastUpdated: '2026-03-29T10:00:00Z',
  entryCount: 10,
};

const mockEntry: Entry = {
  id: 'abc',
  date: '2026-03-30',
  content: 'Had a great day hiking in the mountains.',
  createdAt: '2026-03-30T10:00:00Z',
  updatedAt: '2026-03-30T10:00:00Z',
};

const mockSettings: Settings = { apiKey: 'sk-test', model: 'test', userName: 'Josh', companionName: 'Ember' };

describe('buildAnalysisPrompt', () => {
  it('builds incremental prompt with existing profile', () => {
    const { system, user } = buildAnalysisPrompt(mockProfile, mockEntry);
    expect(system).toContain('personality analyst');
    expect(system).toContain('ONLY valid JSON');
    expect(user).toContain('current personality profile');
    expect(user).toContain('hiking in the mountains');
    expect(user).toContain('Increment entryCount');
  });

  it('builds first-entry prompt without profile', () => {
    const { system, user } = buildAnalysisPrompt(null, mockEntry);
    expect(system).toContain('ONLY valid JSON');
    expect(user).toContain('first journal entry');
    expect(user).toContain('Set entryCount to 1');
  });
});

describe('buildFullRecomputePrompt', () => {
  it('includes all entries', () => {
    const entries = [mockEntry, { ...mockEntry, id: 'def', date: '2026-03-29', content: 'Worked on the project.' }];
    const { system, user } = buildFullRecomputePrompt(entries);
    expect(system).toContain('ALL provided journal entries');
    expect(user).toContain('2 journal entries');
    expect(user).toContain('hiking in the mountains');
    expect(user).toContain('Worked on the project');
  });
});

describe('buildCompanionSystemPrompt', () => {
  it('returns generic prompt without profile', () => {
    const prompt = buildCompanionSystemPrompt(null, mockSettings);
    expect(prompt).toContain('Josh');
    expect(prompt).toContain("hasn't written enough");
  });

  it('includes profile data for early relationship (<5 entries)', () => {
    const earlyProfile = { ...mockProfile, entryCount: 3 };
    const prompt = buildCompanionSystemPrompt(earlyProfile, mockSettings);
    expect(prompt).toContain('still getting to know them');
    expect(prompt).toContain('formality level 40/100');
    expect(prompt).toContain('technology, travel');
  });

  it('uses mid-tier for 5-20 entries', () => {
    const prompt = buildCompanionSystemPrompt(mockProfile, mockSettings);
    expect(prompt).toContain('reference patterns');
    expect(prompt).toContain('Be more personal');
  });

  it('uses deep tier for >20 entries', () => {
    const deepProfile = { ...mockProfile, entryCount: 25 };
    const prompt = buildCompanionSystemPrompt(deepProfile, mockSettings);
    expect(prompt).toContain('You know them well');
    expect(prompt).toContain('trusted friend');
  });

  it('includes Big Five scores', () => {
    const prompt = buildCompanionSystemPrompt(mockProfile, mockSettings);
    expect(prompt).toContain('Openness 75/100');
    expect(prompt).toContain('Neuroticism 30/100');
  });
});

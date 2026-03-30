import { describe, it, expect, beforeEach } from 'vitest';
import { getEntries, saveEntry, deleteEntry, exportEntriesJSON } from '@/lib/storage/entries';
import { getProfile, saveProfile } from '@/lib/storage/profile';
import { getMessages, addMessage, clearMessages } from '@/lib/storage/companion';
import { getSettings, saveSettings } from '@/lib/storage/settings';
import { getStorageUsage, isNearQuota } from '@/lib/storage/quota';
import type { Entry, PersonalityProfile, Message, Settings } from '@/types';

beforeEach(() => {
  window.localStorage.clear();
});

// --------------- Entries ---------------

describe('entries', () => {
  const makeEntry = (overrides: Partial<Entry> = {}): Entry => ({
    id: 'e1',
    date: '2025-01-01',
    content: 'Hello world',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  it('returns empty array when no entries exist', () => {
    expect(getEntries()).toEqual([]);
  });

  it('creates and reads an entry', () => {
    const entry = makeEntry();
    saveEntry(entry);
    const entries = getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('e1');
    expect(entries[0].content).toBe('Hello world');
  });

  it('updates an existing entry by id', () => {
    const entry = makeEntry();
    saveEntry(entry);
    saveEntry({ ...entry, content: 'Updated content' });
    const entries = getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].content).toBe('Updated content');
  });

  it('deletes an entry by id', () => {
    saveEntry(makeEntry({ id: 'e1' }));
    saveEntry(makeEntry({ id: 'e2', content: 'Second' }));
    deleteEntry('e1');
    const entries = getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('e2');
  });

  it('handles corrupt window.localStorage data gracefully', () => {
    window.localStorage.setItem('diary-entries', 'not-json');
    expect(getEntries()).toEqual([]);
  });

  it('handles non-array window.localStorage data gracefully', () => {
    window.localStorage.setItem('diary-entries', JSON.stringify({ foo: 'bar' }));
    expect(getEntries()).toEqual([]);
  });
});

// --------------- Export ---------------

describe('exportEntriesJSON', () => {
  it('exports entries as JSON string', () => {
    const entry: Entry = {
      id: 'e1',
      date: '2025-01-01',
      content: 'Test',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    saveEntry(entry);
    const json = exportEntriesJSON();
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('e1');
  });

  it('exports empty array when no entries', () => {
    expect(exportEntriesJSON()).toBe('[]');
  });
});

// --------------- Profile ---------------

describe('profile', () => {
  const makeProfile = (moodHistoryLength = 10): PersonalityProfile => ({
    emotions: {
      patterns: ['happy'],
      recentMood: 'happy',
      moodHistory: Array.from({ length: moodHistoryLength }, (_, i) => ({
        date: `2025-01-${String(i + 1).padStart(2, '0')}`,
        mood: 'happy',
        valence: 0.8,
      })),
    },
    bigFive: {
      openness: 70,
      conscientiousness: 60,
      extraversion: 50,
      agreeableness: 80,
      neuroticism: 30,
    },
    writingStyle: {
      formality: 50,
      verbosity: 40,
      topTopics: ['work'],
      vocabularyLevel: 'intermediate',
    },
    lastUpdated: new Date().toISOString(),
    entryCount: moodHistoryLength,
  });

  it('returns null when no profile exists', () => {
    expect(getProfile()).toBeNull();
  });

  it('saves and retrieves a profile', () => {
    const profile = makeProfile();
    saveProfile(profile);
    const loaded = getProfile();
    expect(loaded).not.toBeNull();
    expect(loaded!.bigFive.openness).toBe(70);
  });

  it('prunes moodHistory to last 90 entries', () => {
    const profile = makeProfile(120);
    expect(profile.emotions.moodHistory).toHaveLength(120);
    saveProfile(profile);
    const loaded = getProfile()!;
    expect(loaded.emotions.moodHistory).toHaveLength(90);
    // Should keep the last 90 entries (indices 30-119)
    expect(loaded.emotions.moodHistory[0].date).toBe('2025-01-31');
  });

  it('handles corrupt window.localStorage data gracefully', () => {
    window.localStorage.setItem('diary-profile', '{broken');
    expect(getProfile()).toBeNull();
  });
});

// --------------- Companion Messages ---------------

describe('companion messages', () => {
  const makeMessage = (i: number): Message => ({
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `Message ${i}`,
    timestamp: new Date().toISOString(),
  });

  it('returns empty array when no messages', () => {
    expect(getMessages()).toEqual([]);
  });

  it('adds and retrieves messages', () => {
    addMessage(makeMessage(0));
    addMessage(makeMessage(1));
    const msgs = getMessages();
    expect(msgs).toHaveLength(2);
    expect(msgs[0].content).toBe('Message 0');
  });

  it('caps messages at 50, pruning oldest', () => {
    for (let i = 0; i < 55; i++) {
      addMessage(makeMessage(i));
    }
    const msgs = getMessages();
    expect(msgs).toHaveLength(50);
    // Oldest should be message 5 (0-4 pruned)
    expect(msgs[0].content).toBe('Message 5');
    expect(msgs[49].content).toBe('Message 54');
  });

  it('clears all messages', () => {
    addMessage(makeMessage(0));
    clearMessages();
    expect(getMessages()).toEqual([]);
  });

  it('handles corrupt window.localStorage data gracefully', () => {
    window.localStorage.setItem('diary-companion-history', 'bad-data');
    expect(getMessages()).toEqual([]);
  });
});

// --------------- Settings ---------------

describe('settings', () => {
  it('returns defaults when no settings stored', () => {
    const settings = getSettings();
    expect(settings.apiKey).toBe('');
    expect(settings.model).toBe('anthropic/claude-sonnet-4');
    expect(settings.userName).toBe('');
  });

  it('saves and retrieves settings', () => {
    const settings: Settings = {
      apiKey: 'sk-test-123',
      model: 'gpt-4',
      userName: 'Alice',
    };
    saveSettings(settings);
    const loaded = getSettings();
    expect(loaded.apiKey).toBe('sk-test-123');
    expect(loaded.model).toBe('gpt-4');
    expect(loaded.userName).toBe('Alice');
  });

  it('merges partial stored data with defaults', () => {
    window.localStorage.setItem('diary-settings', JSON.stringify({ apiKey: 'key' }));
    const settings = getSettings();
    expect(settings.apiKey).toBe('key');
    expect(settings.model).toBe('anthropic/claude-sonnet-4');
    expect(settings.userName).toBe('');
  });

  it('handles corrupt window.localStorage data gracefully', () => {
    window.localStorage.setItem('diary-settings', 'corrupt');
    const settings = getSettings();
    expect(settings.model).toBe('anthropic/claude-sonnet-4');
  });
});

// --------------- Quota ---------------

describe('quota', () => {
  it('returns 0 when no diary keys exist', () => {
    expect(getStorageUsage()).toBe(0);
  });

  it('calculates storage usage for diary keys', () => {
    window.localStorage.setItem('diary-entries', '[]');
    window.localStorage.setItem('diary-settings', '{}');
    window.localStorage.setItem('other-key', 'ignored');
    const usage = getStorageUsage();
    // diary-entries (13) + [] (2) + diary-settings (14) + {} (2) = 31
    expect(usage).toBe(31);
  });

  it('detects when near quota with default threshold', () => {
    expect(isNearQuota()).toBe(false);
  });

  it('detects when near quota with custom threshold', () => {
    window.localStorage.setItem('diary-entries', 'x'.repeat(100));
    // diary-entries (13) + 100 = 113
    expect(isNearQuota(100)).toBe(true);
    expect(isNearQuota(200)).toBe(false);
  });
});

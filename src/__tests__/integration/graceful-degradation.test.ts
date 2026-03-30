import { describe, it, expect, beforeEach } from 'vitest';
import { saveEntry, getEntries } from '@/lib/storage/entries';
import { getSettings } from '@/lib/storage/settings';
import { getProfile } from '@/lib/storage/profile';

beforeEach(() => {
  window.localStorage.clear();
});

describe('graceful degradation without API key', () => {
  it('entries work without API key', () => {
    const entry = {
      id: 'no-key-1',
      date: '2026-03-30',
      content: 'This should save just fine without an API key.',
      createdAt: '2026-03-30T10:00:00Z',
      updatedAt: '2026-03-30T10:00:00Z',
    };

    saveEntry(entry);
    const entries = getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].content).toContain('just fine');
  });

  it('no API key means empty string', () => {
    const settings = getSettings();
    expect(settings.apiKey).toBe('');
  });

  it('profile is null without analysis', () => {
    expect(getProfile()).toBeNull();
  });

  it('entries persist independently of AI features', () => {
    saveEntry({
      id: 'entry-a',
      date: '2026-03-28',
      content: 'First entry',
      createdAt: '2026-03-28T10:00:00Z',
      updatedAt: '2026-03-28T10:00:00Z',
    });
    saveEntry({
      id: 'entry-b',
      date: '2026-03-29',
      content: 'Second entry',
      createdAt: '2026-03-29T10:00:00Z',
      updatedAt: '2026-03-29T10:00:00Z',
    });

    expect(getEntries()).toHaveLength(2);
    expect(getProfile()).toBeNull();
    expect(getSettings().apiKey).toBe('');
  });
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getTodayString,
  formatDate,
  formatRelativeDate,
  groupEntriesByMonth,
} from '@/lib/utils/date';
import type { Entry } from '@/types';

function makeEntry(overrides: Partial<Entry> & { date: string }): Entry {
  return {
    id: overrides.id ?? 'test-id',
    date: overrides.date,
    content: overrides.content ?? 'Test content',
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  };
}

describe('getTodayString', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const result = getTodayString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches the current local date', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(getTodayString()).toBe(expected);
  });
});

describe('formatDate', () => {
  it('produces a readable date format', () => {
    expect(formatDate('2026-03-29')).toBe('March 29, 2026');
  });

  it('handles single-digit months and days', () => {
    expect(formatDate('2025-01-05')).toBe('January 5, 2025');
  });

  it('handles December correctly', () => {
    expect(formatDate('2025-12-25')).toBe('December 25, 2025');
  });
});

describe('formatRelativeDate', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "Today" for today\'s date', () => {
    const today = getTodayString();
    expect(formatRelativeDate(today)).toBe('Today');
  });

  it('returns "Yesterday" for yesterday\'s date', () => {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    expect(formatRelativeDate(yesterdayStr)).toBe('Yesterday');
  });

  it('returns formatted date for older dates', () => {
    expect(formatRelativeDate('2020-06-15')).toBe('June 15, 2020');
  });
});

describe('groupEntriesByMonth', () => {
  it('groups entries by month', () => {
    const entries = [
      makeEntry({ id: '1', date: '2026-03-15' }),
      makeEntry({ id: '2', date: '2026-03-20' }),
      makeEntry({ id: '3', date: '2026-02-10' }),
    ];

    const groups = groupEntriesByMonth(entries);

    expect(Object.keys(groups)).toHaveLength(2);
    expect(groups['March 2026']).toHaveLength(2);
    expect(groups['February 2026']).toHaveLength(1);
  });

  it('sorts entries newest-first within each group', () => {
    const entries = [
      makeEntry({ id: '1', date: '2026-03-10' }),
      makeEntry({ id: '2', date: '2026-03-25' }),
      makeEntry({ id: '3', date: '2026-03-15' }),
    ];

    const groups = groupEntriesByMonth(entries);
    const marchEntries = groups['March 2026'];

    expect(marchEntries[0].date).toBe('2026-03-25');
    expect(marchEntries[1].date).toBe('2026-03-15');
    expect(marchEntries[2].date).toBe('2026-03-10');
  });

  it('orders month groups newest-first', () => {
    const entries = [
      makeEntry({ id: '1', date: '2026-01-05' }),
      makeEntry({ id: '2', date: '2026-03-20' }),
      makeEntry({ id: '3', date: '2026-02-10' }),
    ];

    const groups = groupEntriesByMonth(entries);
    const keys = Object.keys(groups);

    expect(keys[0]).toBe('March 2026');
    expect(keys[1]).toBe('February 2026');
    expect(keys[2]).toBe('January 2026');
  });

  it('returns empty object for empty input', () => {
    expect(groupEntriesByMonth([])).toEqual({});
  });
});

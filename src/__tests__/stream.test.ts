import { describe, it, expect } from 'vitest';
import {
  buildWeek,
  checkInFor,
  lastSevenDays,
  moodsByEntry,
  soundsLikeCrisis,
  toneOf,
  weekHeadline,
} from '@/lib/stream';
import type { Entry, PersonalityProfile } from '@/types';

const TODAY = '2026-11-06'; // a Friday

const entry = (id: string, date: string, content = 'A day.', hour = 20): Entry => ({
  id,
  date,
  content,
  createdAt: `${date}T${String(hour).padStart(2, '0')}:00:00.000Z`,
  updatedAt: `${date}T${String(hour).padStart(2, '0')}:00:00.000Z`,
});

const profileWith = (points: [string, string, number][]): PersonalityProfile => ({
  emotions: {
    patterns: [],
    recentMood: 'steady',
    moodHistory: points.map(([date, mood, valence]) => ({ date, mood, valence })),
  },
  bigFive: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 },
  writingStyle: { formality: 50, verbosity: 50, topTopics: [], vocabularyLevel: 'conversational' },
  lastUpdated: '2026-11-06T00:00:00.000Z',
  entryCount: points.length,
});

describe('lastSevenDays', () => {
  it('ends today and runs oldest first', () => {
    expect(lastSevenDays(TODAY)).toEqual([
      '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06',
    ]);
  });

  it('crosses a month boundary', () => {
    expect(lastSevenDays('2026-03-02')[0]).toBe('2026-02-24');
  });
});

describe('buildWeek', () => {
  const entries = [entry('a', '2026-10-31'), entry('b', '2026-11-02'), entry('c', '2026-11-06')];
  const profile = profileWith([
    ['2026-10-31', 'Energized', 0.6],
    ['2026-11-02', 'frustrated', -0.5],
    ['2026-11-06', 'proud', 0.7],
  ]);

  it('gives exactly one firefly per entry and none to days without one', () => {
    const week = buildWeek(entries, profile, TODAY);
    expect(week).toHaveLength(7);
    expect(week.map((d) => d.fireflies.length)).toEqual([1, 0, 1, 0, 0, 0, 1]);
  });

  it('names the feeling in lower case and keeps tone separate from position', () => {
    const week = buildWeek(entries, profile, TODAY);
    expect(week[0].fireflies[0]).toMatchObject({ mood: 'energized', tone: 'calm' });
    expect(week[2].fireflies[0]).toMatchObject({ mood: 'frustrated', tone: 'restless' });
    expect(week[2].ripple).toBeCloseTo(0.5);
    expect(week[0].ripple).toBe(0);
  });

  it('labels days and marks today', () => {
    const week = buildWeek(entries, profile, TODAY);
    expect(week[6]).toMatchObject({ label: 'Fri', isToday: true });
    expect(week[0].label).toBe('Sat');
  });

  it('still lights an entry the AI has not read yet', () => {
    const week = buildWeek([entry('x', TODAY)], null, TODAY);
    expect(week[6].fireflies[0]).toMatchObject({ tone: 'unread', mood: null });
  });

  it('pairs several entries on one day with that day’s moods in order', () => {
    const two = [entry('m1', TODAY, 'morning', 8), entry('m2', TODAY, 'night', 21)];
    const p = profileWith([[TODAY, 'tired', -0.4], [TODAY, 'relieved', 0.3]]);
    const today = buildWeek(two, p, TODAY)[6];
    expect(today.fireflies.map((f) => f.mood)).toEqual(['tired', 'relieved']);
  });
});

describe('toneOf', () => {
  it('treats zero as calm and missing as unread', () => {
    expect(toneOf(0)).toBe('calm');
    expect(toneOf(-0.01)).toBe('restless');
    expect(toneOf(null)).toBe('unread');
  });
});

describe('weekHeadline', () => {
  it('never uses grading words', () => {
    const lines = [
      weekHeadline(buildWeek([], null, TODAY)),
      weekHeadline(buildWeek([entry('a', TODAY)], profileWith([[TODAY, 'sad', -0.8]]), TODAY)),
      weekHeadline(buildWeek([entry('a', '2026-11-03')], profileWith([['2026-11-03', 'sad', -0.8]]), TODAY)),
    ];
    for (const line of lines) {
      expect(line).not.toMatch(/\b(bad|low|dark|down|below|worst|sink)/i);
    }
  });

  it('describes today first, then the week', () => {
    expect(weekHeadline(buildWeek([], null, TODAY))).toBe('The water is quiet.');
    expect(weekHeadline(buildWeek([entry('a', TODAY)], profileWith([[TODAY, 'proud', 0.7]]), TODAY))).toBe('Calm water tonight.');
    expect(weekHeadline(buildWeek([entry('a', TODAY)], profileWith([[TODAY, 'tense', -0.4]]), TODAY))).toBe('Restless water tonight.');
    const week = buildWeek(
      [entry('a', '2026-11-01'), entry('b', '2026-11-02'), entry('c', '2026-11-03')],
      profileWith([['2026-11-01', 'calm', 0.4], ['2026-11-02', 'content', 0.3], ['2026-11-03', 'happy', 0.5]]),
      TODAY,
    );
    expect(weekHeadline(week)).toBe('Mostly calm this week.');
  });
});

describe('check-in', () => {
  it('stays away on an ordinary week', () => {
    const entries = [entry('a', '2026-11-02'), entry('b', TODAY)];
    const p = profileWith([['2026-11-02', 'frustrated', -0.5], [TODAY, 'proud', 0.7]]);
    expect(checkInFor(entries, p, TODAY, null)).toBeNull();
  });

  it('checks in after three heavy entries in a week, including the latest', () => {
    const entries = [entry('a', '2026-11-02'), entry('b', '2026-11-04'), entry('c', TODAY)];
    const p = profileWith([['2026-11-02', 'drained', -0.5], ['2026-11-04', 'hopeless', -0.7], [TODAY, 'worn out', -0.6]]);
    expect(checkInFor(entries, p, TODAY, null)).toEqual({ reason: 'heavy-run', entryId: 'c', heavyCount: 3 });
  });

  it('does not check in when the latest entry is lighter again', () => {
    const entries = [entry('a', '2026-11-02'), entry('b', '2026-11-03'), entry('c', '2026-11-04'), entry('d', TODAY)];
    const p = profileWith([
      ['2026-11-02', 'drained', -0.5], ['2026-11-03', 'sad', -0.6], ['2026-11-04', 'tired', -0.4], [TODAY, 'relieved', 0.4],
    ]);
    expect(checkInFor(entries, p, TODAY, null)).toBeNull();
  });

  it('checks in on crisis words even before the AI has read the entry', () => {
    const entries = [entry('a', TODAY, 'Some days I just want to die.')];
    expect(checkInFor(entries, null, TODAY, null)).toMatchObject({ reason: 'crisis', entryId: 'a' });
  });

  it('stays dismissed for that entry, and comes back for a newer one', () => {
    const entries = [entry('a', TODAY, 'I keep thinking about ending my life.')];
    expect(checkInFor(entries, null, TODAY, 'a')).toBeNull();
    const newer = [...entries, entry('b', TODAY, 'I want to hurt myself.', 23)];
    expect(checkInFor(newer, null, TODAY, 'a')).toMatchObject({ entryId: 'b' });
  });

  it('recognises crisis phrasing but not everyday words', () => {
    expect(soundsLikeCrisis('I have been thinking about suicide')).toBe(true);
    expect(soundsLikeCrisis("I don't want to wake up tomorrow")).toBe(true);
    expect(soundsLikeCrisis('Killed it at the gym today, exhausted')).toBe(false);
  });
});

describe('moodsByEntry', () => {
  it('maps every entry to its feeling, including old ones outside the week', () => {
    const entries = [entry('old', '2026-09-01'), entry('new', TODAY)];
    const p = profileWith([['2026-09-01', 'hopeful', 0.4], [TODAY, 'tense', -0.3]]);
    const moods = moodsByEntry(entries, p);
    expect(moods.old).toMatchObject({ mood: 'hopeful', tone: 'calm' });
    expect(moods.new).toMatchObject({ mood: 'tense', tone: 'restless' });
  });
});

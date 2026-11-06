import type { Entry, MoodPoint, PersonalityProfile } from '@/types';

/**
 * The Stream: how a week of entries becomes fireflies on a riverbank.
 *
 * Rules the design depends on (2026-11, Josh):
 * - One firefly per entry. A hard day counts the same as a good one.
 * - Mood never moves a firefly up or down. It shows in colour (gold when the
 *   feeling leans calm or good, soft blue when it leans heavy) and in the
 *   water under the day (still, or rippled).
 * - Feelings are named, days are never graded. Nothing in here produces a
 *   score the person sees.
 * - An entry the AI hasn't read yet still gets a firefly, in plain cream.
 *
 * All pure functions of their inputs, so they are unit-tested directly.
 */

export type Tone = 'calm' | 'restless' | 'unread';

export interface StreamFirefly {
  entryId: string;
  /** The AI's one-word feeling for the entry, e.g. "proud". Null until read. */
  mood: string | null;
  tone: Tone;
  /** How strongly felt, 0..1. Only ripples and glow size use it. */
  strength: number;
}

export interface StreamDay {
  date: string; // YYYY-MM-DD
  label: string; // Mon, Tue, …
  isToday: boolean;
  fireflies: StreamFirefly[];
  /** Ripple height for the water under the day, 0 = still. */
  ripple: number;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** The seven dates ending today, oldest first. */
export function lastSevenDays(today: string): string[] {
  const end = fromKey(today);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (6 - i));
    return toKey(d);
  });
}

/** Mood points for a date, in the order the AI recorded them. */
function pointsFor(history: MoodPoint[], date: string): MoodPoint[] {
  return history.filter((p) => p.date === date);
}

export function toneOf(valence: number | null | undefined): Tone {
  if (valence === null || valence === undefined || Number.isNaN(valence)) return 'unread';
  return valence < 0 ? 'restless' : 'calm';
}

/**
 * Matches each entry to a mood. The analysis keeps one mood point per entry,
 * by date; with several entries on one day they pair up in order, and any
 * extra entry borrows the day's last point.
 */
export function fireflyFor(entry: Entry, indexInDay: number, history: MoodPoint[]): StreamFirefly {
  const points = pointsFor(history, entry.date);
  const point = points[indexInDay] ?? points[points.length - 1];
  if (!point) return { entryId: entry.id, mood: null, tone: 'unread', strength: 0 };
  return {
    entryId: entry.id,
    mood: point.mood ? point.mood.toLowerCase() : null,
    tone: toneOf(point.valence),
    strength: Math.min(1, Math.abs(point.valence)),
  };
}

export function buildWeek(entries: Entry[], profile: PersonalityProfile | null, today: string): StreamDay[] {
  const history = profile?.emotions.moodHistory ?? [];
  return lastSevenDays(today).map((date) => {
    const dayEntries = entries
      .filter((e) => e.date === date)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const fireflies = dayEntries.map((e, i) => fireflyFor(e, i, history));
    const restless = fireflies.filter((f) => f.tone === 'restless');
    const ripple = restless.length ? Math.max(...restless.map((f) => f.strength)) : 0;
    return {
      date,
      label: DAY_LABELS[fromKey(date).getDay()],
      isToday: date === today,
      fireflies,
      ripple,
    };
  });
}

/** The line at the top of the journal. Describes the water, never grades it. */
export function weekHeadline(week: StreamDay[]): string {
  const all = week.flatMap((d) => d.fireflies);
  if (all.length === 0) return 'The water is quiet.';
  const today = week.find((d) => d.isToday);
  if (today && today.fireflies.length) {
    const tones = today.fireflies.map((f) => f.tone);
    if (tones.includes('restless')) return 'Restless water tonight.';
    if (tones.every((t) => t === 'unread')) return 'A new light on the bank.';
    return 'Calm water tonight.';
  }
  const calm = all.filter((f) => f.tone === 'calm').length;
  const restless = all.filter((f) => f.tone === 'restless').length;
  if (calm + restless === 0) return 'New lights on the bank.';
  if (restless === 0 || calm >= restless * 2) return 'Mostly calm this week.';
  if (restless > calm) return 'A restless week on the water.';
  return 'A mixed week on the water.';
}

// ── The check-in ─────────────────────────────────────────────────────────

/**
 * Words that mean someone may be in crisis. Matched loosely on purpose: a
 * false alarm costs one dismissable card, a miss costs far more.
 */
const CRISIS = [
  /\bkill(ing)? myself\b/i,
  /\bsuicid/i,
  /\bend(ing)? (it all|my life)\b/i,
  /\bwant(ed)? to die\b/i,
  /\bdon'?t want to (be here|live|wake up)\b/i,
  /\bhurt(ing)? myself\b/i,
  /\bself[- ]harm/i,
  /\bno (reason|point) (to|in) (live|living|go on|going on)\b/i,
];

export function soundsLikeCrisis(text: string): boolean {
  return CRISIS.some((re) => re.test(text));
}

export interface CheckIn {
  reason: 'crisis' | 'heavy-run';
  /** The entry it is about, so dismissing it holds until something newer. */
  entryId: string;
  /** How many heavy entries in the last seven days (for the heavy-run text). */
  heavyCount: number;
}

/** A feeling counts as heavy below this. Mild tiredness stays out of it. */
export const HEAVY = -0.3;

/**
 * When the stream steps back and the app checks in:
 * - the latest entry (written in the last two days) sounds like crisis, or
 * - three or more of the last seven days' entries were heavy, including the
 *   latest one.
 * Returns null otherwise, or when the person already dismissed it for this entry.
 */
export function checkInFor(
  entries: Entry[],
  profile: PersonalityProfile | null,
  today: string,
  dismissedFor: string | null,
): CheckIn | null {
  if (entries.length === 0) return null;
  const latest = [...entries].sort((a, b) =>
    (b.date + b.createdAt).localeCompare(a.date + a.createdAt),
  )[0];
  if (latest.id === dismissedFor) return null;

  const days = lastSevenDays(today);
  const recent = (date: string) => days.includes(date);

  if (days.slice(-2).includes(latest.date) && soundsLikeCrisis(latest.content)) {
    return { reason: 'crisis', entryId: latest.id, heavyCount: 0 };
  }

  const history = profile?.emotions.moodHistory ?? [];
  const week = entries.filter((e) => recent(e.date));
  const byDay = new Map<string, number>();
  let heavyCount = 0;
  let latestHeavy = false;
  for (const e of [...week].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const i = byDay.get(e.date) ?? 0;
    byDay.set(e.date, i + 1);
    const points = pointsFor(history, e.date);
    const p = points[i] ?? points[points.length - 1];
    if (p && p.valence <= HEAVY) {
      heavyCount += 1;
      if (e.id === latest.id) latestHeavy = true;
    }
  }
  if (heavyCount >= 3 && latestHeavy) {
    return { reason: 'heavy-run', entryId: latest.id, heavyCount };
  }
  return null;
}

/** Every entry's firefly (its mood and tone), keyed by entry id, for the entries list. */
export function moodsByEntry(entries: Entry[], profile: PersonalityProfile | null): Record<string, StreamFirefly> {
  const history = profile?.emotions.moodHistory ?? [];
  const out: Record<string, StreamFirefly> = {};
  const byDate = new Map<string, Entry[]>();
  for (const e of entries) byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]);
  for (const list of byDate.values()) {
    list
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .forEach((e, i) => {
        out[e.id] = fireflyFor(e, i, history);
      });
  }
  return out;
}

/** Friendly names for the Big Five, in the order the profile stores them. */
export const TRAITS = [
  { key: 'openness', name: 'Curious', science: 'Openness' },
  { key: 'conscientiousness', name: 'Organized', science: 'Conscientiousness' },
  { key: 'extraversion', name: 'Outgoing', science: 'Extraversion' },
  { key: 'agreeableness', name: 'Warm', science: 'Agreeableness' },
  { key: 'neuroticism', name: 'Sensitive', science: 'Emotional sensitivity' },
] as const;

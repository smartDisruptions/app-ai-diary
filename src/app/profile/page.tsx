'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Entry } from '@/types';
import { getEntries } from '@/lib/storage/entries';
import { EmptyState } from '@/components/ui/EmptyState';
import { BigFiveChart } from '@/components/profile/BigFiveChart';
import { WritingStyleCard } from '@/components/profile/WritingStyleCard';
import { EmotionPatterns } from '@/components/profile/EmotionPatterns';
import { StreamScene } from '@/components/stream/StreamScene';
import { EmberMark } from '@/components/stream/EmberMark';
import { useCompanionName, useHasApiKey, useProfile, useToday } from '@/hooks/useClientValues';
import { buildWeek, weekHeadline } from '@/lib/stream';

/**
 * Patterns (the old Insights; the address stays /profile). Only ever shows
 * what the AI actually found. Before there is a profile it says so, instead
 * of the made-up sample profile this page used to show.
 */
export default function ProfilePage() {
  const { profile, ready } = useProfile();
  const [entries, setEntries] = useState<Entry[]>([]);
  const today = useToday();
  const name = useCompanionName();
  const aiOn = useHasApiKey();

  useEffect(() => {
    setEntries(getEntries());
  }, []);

  const week = useMemo(() => (today ? buildWeek(entries, profile, today) : null), [entries, profile, today]);

  if (!ready) return null;

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-5 pt-[calc(40px+env(safe-area-inset-top,0px))] md:px-8 md:pt-16 pb-tabbar">
        <EmptyState
          icon={<EmberMark size={64} blink />}
          title="No patterns yet"
          description="Your patterns show up here once you’ve written a few entries."
        >
          <p className="max-w-sm text-[14px] leading-relaxed text-[var(--cream-soft)]">
            {aiOn
              ? `Write a few entries and ${name} will start finding your patterns: the feelings that keep coming up, what you write about, and how you write.`
              : `${name} needs the AI turned on to read your entries.`}
          </p>
          {!aiOn && (
            <Link href="/settings" className="mt-4 text-[14px] font-semibold text-gold underline underline-offset-4">
              Add an AI key in Settings
            </Link>
          )}
        </EmptyState>
      </div>
    );
  }

  const { emotions, bigFive, writingStyle, entryCount, observation } = profile;

  return (
    <div className="mx-auto grid max-w-2xl gap-5 px-5 pt-[calc(28px+env(safe-area-inset-top,0px))] md:px-8 md:pt-12 pb-tabbar">
      <header className="grid gap-2">
        <p className="eyebrow">
          Patterns · from {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </p>
        <h1 className="display text-[38px] md:text-[44px]">{week ? weekHeadline(week).replace('tonight', 'today') : 'Your patterns'}</h1>
      </header>

      <section className="grid gap-2" aria-labelledby="p-week">
        <h2 id="p-week" className="section-label">
          The week on the water
        </h2>
        {week && <StreamScene days={week} compact />}
      </section>

      {observation ? (
        <div className="panel flex items-start gap-3 px-4 py-3.5 text-[14px] leading-relaxed">
          <EmberMark size={28} />
          <p>
            <b className="text-gold">{name}</b> noticed {observation}
          </p>
        </div>
      ) : null}

      <section className="panel grid gap-4 p-5" aria-labelledby="p-person">
        <div>
          <h2 id="p-person" className="section-label">
            Personality · five jars
          </h2>
          <p className="mt-1 text-[12.5px] text-[var(--cream-soft)]">
            Read from your writing. They shift slowly as you write more, and no jar is better fuller.
          </p>
        </div>
        <BigFiveChart bigFive={bigFive} />
      </section>

      <section className="panel grid gap-3 p-5" aria-labelledby="p-feel">
        <h2 id="p-feel" className="section-label">
          Feelings that come up
        </h2>
        <EmotionPatterns emotions={emotions} />
      </section>

      <section className="panel grid gap-4 p-5" aria-labelledby="p-write">
        <h2 id="p-write" className="section-label">
          How you write
        </h2>
        <WritingStyleCard writingStyle={writingStyle} />
      </section>

      {writingStyle.topTopics.length > 0 && (
        <section className="panel grid gap-3 p-5" aria-labelledby="p-topics">
          <h2 id="p-topics" className="section-label">
            What you write about
          </h2>
          <ul className="flex flex-wrap gap-2">
            {writingStyle.topTopics.map((topic) => (
              <li key={topic} className="tag">
                {topic}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

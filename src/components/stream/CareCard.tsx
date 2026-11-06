'use client';

import React from 'react';
import Link from 'next/link';
import type { CheckIn } from '@/lib/stream';

/**
 * The check-in. When a run of heavy entries or crisis words shows up, the
 * stream steps back and the app speaks plainly: no metaphors, no character
 * voice, no scores. The 988 line is given as information to read, not as a
 * tap-to-call button (Josh, 2026-11-06).
 */
export function CareCard({
  checkIn,
  companionName,
  onDismiss,
}: {
  checkIn: CheckIn;
  companionName: string;
  onDismiss: () => void;
}) {
  const crisis = checkIn.reason === 'crisis';
  return (
    <section
      className="rise-in rounded-[20px] p-5 grid gap-3"
      style={{ background: 'var(--cream)', color: '#241a14' }}
      aria-labelledby="care-title"
      role="region"
    >
      <h2 id="care-title" className="text-[17px] font-bold">
        {crisis ? 'What you wrote sounds really heavy.' : 'It’s been a heavy few days.'}
      </h2>
      <p className="text-[14px] leading-relaxed">
        {crisis
          ? 'Thank you for writing it down. You don’t have to carry this on your own.'
          : `You’ve written about feeling worn down ${checkIn.heavyCount} times this week. That’s a lot to carry on your own.`}
      </p>
      <div className="grid gap-2 mt-1">
        <Link
          href="/companion"
          className="text-center rounded-xl px-4 py-3 text-[14px] font-bold min-h-[44px]"
          style={{ background: '#241a14', color: 'var(--cream)' }}
        >
          Talk it through with {companionName}
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xl px-4 py-2.5 text-[14px] font-semibold min-h-[44px] cursor-pointer"
          style={{ color: '#6b5a4a' }}
        >
          Not now
        </button>
      </div>
      <p className="text-[12.5px] leading-relaxed" style={{ color: '#5a4a3c' }}>
        If you need to talk to someone now, you can call or text <strong>988</strong>, the Suicide &amp; Crisis
        Lifeline in the US. It’s free and open any time. Outside the US, your local emergency number can help.
      </p>
    </section>
  );
}

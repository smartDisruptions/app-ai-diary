'use client';

import React from 'react';
import type { BigFive } from '@/types';
import { TRAITS } from '@/lib/stream';

/**
 * Personality as five jars of light, each filled to its score. Friendly
 * names on the label (Curious, not Openness); the research name is kept for
 * screen readers and as a hover title. Every jar is the same gold: none of
 * the five is better or worse to have more of.
 */
export function BigFiveChart({ bigFive }: { bigFive: BigFive }) {
  return (
    <div className="grid grid-cols-5 gap-2" role="list">
      {TRAITS.map((t, i) => {
        const score = Math.round(bigFive[t.key]);
        const level = 44 * (score / 100);
        const clip = `jar-${t.key}`;
        return (
          <div
            key={t.key}
            role="listitem"
            title={`${t.science}: ${score} of 100`}
            aria-label={`${t.name} (${t.science}): ${score} of 100`}
            className="grid justify-items-center gap-1 min-w-0"
          >
            <svg viewBox="0 0 40 60" className="w-full max-w-[52px]" aria-hidden="true">
              <defs>
                <clipPath id={clip}>
                  <path d="M11 9 q -8 4 -8 11 v 30 q 0 6 6 6 h 22 q 6 0 6 -6 v -30 q 0 -7 -8 -11 z" />
                </clipPath>
              </defs>
              <path d="M11 9 q -8 4 -8 11 v 30 q 0 6 6 6 h 22 q 6 0 6 -6 v -30 q 0 -7 -8 -11 z" fill="rgba(244,230,204,0.05)" />
              <g clipPath={`url(#${clip})`}>
                <rect x="0" y={56 - level} width="40" height={level + 4} fill="#f2b55e" opacity="0.78" />
                <circle className="firefly-blink" cx={14 + (i % 3) * 5} cy={Math.max(26, 54 - level + 8)} r="3.2" fill="url(#sd-fly)" />
              </g>
              <path d="M11 9 q -8 4 -8 11 v 30 q 0 6 6 6 h 22 q 6 0 6 -6 v -30 q 0 -7 -8 -11 z" fill="none" stroke="rgba(244,230,204,0.42)" />
              <path d="M10 18 v 18" stroke="rgba(255,255,255,0.16)" strokeWidth="2" strokeLinecap="round" />
              <rect x="10" y="2" width="20" height="6" rx="2" fill="#6b4a2e" />
            </svg>
            <span className="text-[13px] font-bold tabular-nums text-cream">{score}</span>
            <span className="text-[11.5px] text-[var(--cream-soft)] truncate max-w-full">{t.name}</span>
          </div>
        );
      })}
    </div>
  );
}

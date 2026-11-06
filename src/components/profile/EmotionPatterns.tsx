'use client';

import React from 'react';
import type { EmotionData } from '@/types';

/** The feeling of late, and the feelings that keep coming up. Named, never scored. */
export function EmotionPatterns({ emotions }: { emotions: EmotionData }) {
  return (
    <div className="grid gap-3">
      <p className="flex items-baseline gap-2">
        <span className="font-serif italic text-[26px] font-semibold text-gold leading-none">
          {emotions.recentMood}
        </span>
        <span className="text-[12px] text-[var(--cream-soft)]">lately</span>
      </p>
      {emotions.patterns.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Feelings that keep coming up">
          {emotions.patterns.map((pattern) => (
            <li key={pattern} className="tag">
              {pattern}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import type { EmotionData } from '@/types';

interface EmotionPatternsProps {
  emotions: EmotionData;
}

const BADGE_COLORS = [
  { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', text: '#818cf8' },
  { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#34d399' },
  { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)', text: '#f472b6' },
  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24' },
  { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', text: '#a78bfa' },
  { bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.25)', text: '#2dd4bf' },
];

export function EmotionPatterns({ emotions }: EmotionPatternsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <span style={{ fontSize: '22px', fontWeight: 700, color: '#34d399' }}>
          {emotions.recentMood}
        </span>
        <span style={{ fontSize: '12px', color: 'rgba(200,184,164,0.4)' }}>
          right now
        </span>
      </div>

      {emotions.patterns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {emotions.patterns.map((pattern, i) => {
            const colors = BADGE_COLORS[i % BADGE_COLORS.length];
            return (
              <span
                key={pattern}
                className="rounded-full px-3.5 py-1.5"
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  background: colors.bg,
                }}
              >
                {pattern}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

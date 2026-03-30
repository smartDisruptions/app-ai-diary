'use client';

import React from 'react';
import type { BigFive } from '@/types';

const TRAITS: { key: keyof BigFive; label: string; color: string; glow: string }[] = [
  { key: 'openness', label: 'Openness', color: 'linear-gradient(to right, #6366f1, #818cf8)', glow: 'rgba(99,102,241,0.15)' },
  { key: 'conscientiousness', label: 'Conscientiousness', color: 'linear-gradient(to right, #10b981, #34d399)', glow: 'rgba(16,185,129,0.15)' },
  { key: 'extraversion', label: 'Extraversion', color: 'linear-gradient(to right, #f59e0b, #fbbf24)', glow: 'rgba(245,158,11,0.15)' },
  { key: 'agreeableness', label: 'Agreeableness', color: 'linear-gradient(to right, #ec4899, #f472b6)', glow: 'rgba(236,72,153,0.15)' },
  { key: 'neuroticism', label: 'Neuroticism', color: 'linear-gradient(to right, #8b5cf6, #a78bfa)', glow: 'rgba(139,92,246,0.15)' },
];

interface BigFiveChartProps {
  bigFive: BigFive;
}

export function BigFiveChart({ bigFive }: BigFiveChartProps) {
  return (
    <div className="space-y-4">
      {TRAITS.map(({ key, label, color, glow }) => {
        const score = bigFive[key];
        const pct = Math.max(0, Math.min(100, score));
        return (
          <div key={key} className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span style={{ fontSize: '13px', color: 'rgba(212,196,176,0.7)', fontWeight: 500 }}>
                {label}
              </span>
              <span style={{ fontSize: '13px', color: 'rgba(212,196,176,0.9)', fontWeight: 600 }}>
                {score}
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: color,
                  /* subtle glow */
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

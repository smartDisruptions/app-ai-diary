'use client';

import React from 'react';
import type { MoodPoint } from '@/types';

interface MoodTimelineProps {
  moodHistory: MoodPoint[];
}

function valenceToColor(valence: number): string {
  // -1 (negative) → cool purple/blue, 0 (neutral) → teal, 1 (positive) → warm green/yellow
  if (valence < -0.3) return '#8b5cf6'; // purple
  if (valence < 0) return '#6366f1'; // indigo
  if (valence < 0.2) return '#14b8a6'; // teal
  if (valence < 0.5) return '#10b981'; // emerald
  return '#34d399'; // bright green
}

export function MoodTimeline({ moodHistory }: MoodTimelineProps) {
  const points = moodHistory.slice(-30);

  if (points.length === 0) {
    return (
      <p style={{ fontSize: '12px', color: 'rgba(200,184,164,0.5)' }}>
        No mood data yet.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height: '80px' }}>
        {points.map((point, i) => {
          const heightPct = ((point.valence + 1) / 2) * 85 + 15;
          const color = valenceToColor(point.valence);
          return (
            <div
              key={`${point.date}-${i}`}
              className="flex-1 min-w-[8px] rounded-t-sm transition-all duration-300"
              style={{
                height: `${heightPct}%`,
                background: `linear-gradient(to top, ${color}40, ${color})`,
                opacity: 0.6 + (i / points.length) * 0.4,
                /* no glow */
              }}
              title={`${point.mood} (${point.date})`}
            />
          );
        })}
      </div>
      <div
        className="flex justify-between mt-2"
        style={{ fontSize: '10px', color: 'rgba(200,184,164,0.25)' }}
      >
        <span>{points[0]?.date.slice(5)}</span>
        <span>{points[points.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

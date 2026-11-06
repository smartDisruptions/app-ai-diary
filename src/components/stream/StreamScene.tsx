'use client';

import React from 'react';
import type { StreamDay, StreamFirefly } from '@/lib/stream';
import { paintFor } from './StreamDefs';

/**
 * The week on the water: seven days on a riverbank, one firefly per entry.
 *
 * A firefly's height never encodes mood. Mood shows as colour and in the water
 * under the day: still lines and a clear reflection when calm, ripples and a
 * broken reflection when restless. Tapping a firefly opens its entry.
 */

const W = 336;
const COL = W / 7;
const DAY_NAMES: Record<string, string> = {
  Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday',
};

interface StreamSceneProps {
  days: StreamDay[];
  compact?: boolean;
  onOpenEntry?: (entryId: string) => void;
}

interface Placed {
  fly: StreamFirefly;
  day: StreamDay;
  cx: number;
  cy: number;
  r: number;
}

function place(days: StreamDay[], bank: number, base: number): Placed[] {
  const out: Placed[] = [];
  days.forEach((day, i) => {
    const shown = day.fireflies.slice(0, 4);
    const n = shown.length;
    const spread = n > 1 ? COL * 0.62 : 0;
    shown.forEach((fly, k) => {
      const cx = i * COL + COL / 2 + (n > 1 ? -spread / 2 + (spread * k) / (n - 1) : 0);
      const cy = bank - base * 2.7 - (i % 2) * 6 - (n > 1 ? (k % 2) * 7 : 0);
      const r = (n > 1 ? base * 0.78 : base) * (0.92 + fly.strength * 0.18) * (day.isToday ? 1.12 : 1);
      out.push({ fly, day, cx, cy, r });
    });
  });
  return out;
}

function ripples(x: number, top: number, height: number, ripple: number) {
  const lines: React.ReactNode[] = [];
  const amp = ripple > 0 ? 1.5 + ripple * 7 : 0;
  for (let k = 0; k < 4; k++) {
    const y = top + 10 + (k * (height - 16)) / 3;
    if (amp === 0) {
      lines.push(<line key={k} x1={x + 4} y1={y} x2={x + COL - 4} y2={y} stroke="rgba(244,230,204,0.1)" />);
    } else {
      const a = amp * (1 - k * 0.15);
      const seg = (COL - 4) / 4;
      const d =
        `M${x + 2} ${y} ` +
        [0, 1, 2, 3].map((j) => `q ${seg / 2} ${j % 2 === 0 ? -a : a} ${seg} 0`).join(' ');
      lines.push(<path key={k} className="ripple-drift" d={d} fill="none" stroke="rgba(170,182,240,0.32)" />);
    }
  }
  return lines;
}

export function describeWeek(days: StreamDay[]): string {
  const parts = days
    .filter((d) => d.fireflies.length)
    .map((d) => {
      const moods = d.fireflies.map((f) => f.mood ?? 'not read yet').join(' and ');
      return `${DAY_NAMES[d.label]}: ${moods}`;
    });
  return parts.length ? `This week on the water. ${parts.join('. ')}.` : 'No entries this week yet.';
}

export function StreamScene({ days, compact = false, onOpenEntry }: StreamSceneProps) {
  const H = compact ? 132 : 196;
  const bank = compact ? 72 : 104;
  const base = compact ? 8.5 : 11.5;
  const placed = place(days, bank, base);
  const single = new Set(days.filter((d) => d.fireflies.length === 1).map((d) => d.date));

  return (
    <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={describeWeek(days)}>
        <rect x="0" y={bank} width={W} height={H - bank} fill="url(#sd-water)" rx="2" />
        {days.map((day, i) => (
          <g key={day.date}>{ripples(i * COL, bank, H - bank, day.ripple)}</g>
        ))}

        {/* reflections: clear when calm, broken when restless */}
        <g filter="url(#sd-blur)" opacity="0.5">
          {placed.map(({ fly, cx, cy, r }) =>
            fly.tone === 'restless' ? (
              [0, 1, 2].map((k) => (
                <circle
                  key={`${fly.entryId}-r${k}`}
                  cx={cx + (k - 1) * (4 + fly.strength * 7)}
                  cy={bank + (bank - cy) * 0.55 + (k % 2) * 4}
                  r={r * 0.75}
                  fill={paintFor('restless')}
                />
              ))
            ) : (
              <circle key={`${fly.entryId}-r`} cx={cx} cy={bank + (bank - cy) * 0.55} r={r * 1.5} fill={paintFor(fly.tone)} />
            ),
          )}
        </g>

        <line x1="0" y1={bank} x2={W} y2={bank} stroke="rgba(244,230,204,0.2)" />

        {/* empty days: a quiet ring, no penalty */}
        {days.map((day, i) =>
          day.fireflies.length === 0 ? (
            <circle
              key={`${day.date}-empty`}
              cx={i * COL + COL / 2}
              cy={bank - base * 2.7 - (i % 2) * 6}
              r={2.4}
              fill="none"
              stroke="rgba(244,230,204,0.25)"
            />
          ) : null,
        )}

        {placed.map(({ fly, day, cx, cy, r }) => (
          <g key={fly.entryId}>
            <circle className={day.isToday ? 'firefly-blink' : undefined} cx={cx} cy={cy} r={r * 1.75} fill={paintFor(fly.tone)} />
            <circle cx={cx} cy={cy} r={r * 0.28} fill="#fff7c2" />
            {single.has(day.date) && fly.mood ? (
              <text
                x={cx}
                y={cy - r * 1.75 - 3}
                fontSize={compact ? 8 : 9.5}
                fontStyle="italic"
                textAnchor="middle"
                fill={fly.tone === 'restless' ? '#c3cbf2' : '#f7d6a3'}
              >
                {fly.mood}
              </text>
            ) : null}
          </g>
        ))}

        {days.map((day, i) => (
          <text
            key={`${day.date}-label`}
            x={i * COL + COL / 2}
            y={bank - 5}
            fontSize={compact ? 8.5 : 10}
            fontWeight={600}
            textAnchor="middle"
            fill={day.isToday ? '#f2b55e' : 'rgba(244,230,204,0.5)'}
          >
            {day.label}
          </text>
        ))}
      </svg>

      {onOpenEntry
        ? placed.map(({ fly, day, cx, cy }) => (
            <button
              key={`${fly.entryId}-tap`}
              type="button"
              onClick={() => onOpenEntry(fly.entryId)}
              aria-label={`Open ${DAY_NAMES[day.label]}’s entry${fly.mood ? `, ${fly.mood}` : ''}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer"
              style={{ left: `${(cx / W) * 100}%`, top: `${(cy / H) * 100}%`, width: 44, height: 44 }}
            />
          ))
        : null}
    </div>
  );
}

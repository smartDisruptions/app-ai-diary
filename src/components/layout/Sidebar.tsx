'use client';

import React from 'react';
import Link from 'next/link';
import { useNavItems } from './nav';
import { EmberMark } from '@/components/stream/EmberMark';

/** The side rail on wider screens. */
export function Sidebar() {
  const items = useNavItems();
  return (
    <aside
      className="hidden md:flex flex-col w-60 h-screen fixed left-0 top-0 z-30"
      style={{ background: 'rgba(14,12,16,0.72)', borderRight: '1px solid var(--line)' }}
    >
      <div className="px-6 pt-7 pb-6 flex items-center gap-2.5">
        <EmberMark size={28} blink />
        <span className="display text-[26px]">AI Diary</span>
      </div>
      <nav className="flex-1 px-3 grid content-start gap-1" aria-label="Main navigation">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-colors duration-200"
              style={{
                color: item.active ? 'var(--gold)' : 'rgba(244,230,204,0.55)',
                background: item.active ? 'rgba(242,181,94,0.08)' : 'transparent',
              }}
            >
              <Icon />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

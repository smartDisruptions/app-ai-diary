'use client';

import React from 'react';
import Link from 'next/link';
import { useNavItems } from './nav';

/** The floating tab bar on phones. */
export function MobileTabBar() {
  const items = useNavItems();
  return (
    <nav
      className="md:hidden fixed z-40 left-3 right-3 rounded-[24px]"
      style={{
        bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(18,15,20,0.88)',
        border: '1px solid var(--line)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-[62px]">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className="flex flex-col items-center gap-1 min-w-[64px] max-w-[84px] py-1"
              style={{ color: item.active ? 'var(--gold)' : 'rgba(244,230,204,0.45)' }}
            >
              <Icon />
              <span className="text-[10.5px] font-semibold leading-none truncate max-w-full">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

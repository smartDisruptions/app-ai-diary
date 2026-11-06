'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useCompanionName } from '@/hooks/useClientValues';

/** The four places in the app. The chat tab is named after the companion. */

function StreamIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="6.5" r="2.4" fill="currentColor" stroke="none" />
      <path d="M3 14c2.2-1.6 4.4-1.6 6.6 0s4.4 1.6 6.6 0 3.6-1.2 4.8-.6" />
      <path d="M3 18.5c2.2-1.6 4.4-1.6 6.6 0s4.4 1.6 6.6 0 3.6-1.2 4.8-.6" opacity="0.6" />
    </svg>
  );
}

function CompanionIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5a2 2 0 0 1-2 2H8.5L4 20V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="10.2" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function JarIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 3.5h7" />
      <path d="M9 3.5v2.2C6.8 6.6 5.5 8.3 5.5 10.5v7.2A2.3 2.3 0 0 0 7.8 20h8.4a2.3 2.3 0 0 0 2.3-2.3v-7.2c0-2.2-1.3-3.9-3.5-4.8V3.5" />
      <circle cx="10.5" cy="13" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export interface NavItem {
  label: string;
  href: string;
  icon: () => React.ReactElement;
  active: boolean;
}

export function useNavItems(): NavItem[] {
  const pathname = usePathname() ?? '/';
  const companion = useCompanionName();
  const items = [
    { label: 'Stream', href: '/', icon: StreamIcon },
    { label: companion, href: '/companion', icon: CompanionIcon },
    { label: 'Patterns', href: '/profile', icon: JarIcon },
    { label: 'Settings', href: '/settings', icon: GearIcon },
  ];
  return items.map((it) => ({
    ...it,
    active: it.href === '/' ? pathname === '/' : pathname.startsWith(it.href),
  }));
}

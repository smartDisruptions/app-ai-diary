'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen md:ml-60">{children}</main>
      <MobileTabBar />
    </>
  );
}

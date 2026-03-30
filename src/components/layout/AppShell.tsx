'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen pb-20 md:pb-0 md:ml-60">
        {children}
      </main>
      <MobileTabBar />
    </>
  );
}

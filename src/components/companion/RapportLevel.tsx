'use client';

import React from 'react';

interface RapportLevelProps {
  entryCount: number;
}

function getRapportLabel(count: number): string {
  if (count > 20) return 'Trusted companion';
  if (count >= 5) return 'Building rapport';
  return 'Getting to know you';
}

export function RapportLevel({ entryCount }: RapportLevelProps) {
  return (
    <span className="text-text-muted text-xs">
      {getRapportLabel(entryCount)} &middot; {entryCount}{' '}
      {entryCount === 1 ? 'entry' : 'entries'}
    </span>
  );
}

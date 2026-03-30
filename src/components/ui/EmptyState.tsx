'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-copper">{icon}</div>}
      <h3 className="text-text-heading text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-text-muted text-sm max-w-sm mb-6">{description}</p>
      )}
      {children}
    </div>
  );
}

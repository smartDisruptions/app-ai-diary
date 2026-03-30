'use client';

import React from 'react';

interface BadgeProps {
  variant?: 'solid' | 'outline';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'solid', children, className = '' }: BadgeProps) {
  const variants = {
    solid:
      'bg-gradient-to-r from-copper to-copper-deep text-bg-primary rounded-full px-3 py-1 text-xs uppercase tracking-wider font-semibold',
    outline:
      'bg-transparent border border-copper text-copper rounded-full px-3 py-1 text-xs uppercase tracking-wider font-semibold',
  };

  return (
    <span className={`inline-block ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

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
      'bg-gradient-to-b from-[#f4c578] to-[#e19a3f] text-[#2a1709] rounded-full px-3 py-1 text-xs font-semibold',
    outline:
      'bg-[rgba(242,181,94,0.1)] border border-[rgba(242,181,94,0.35)] text-[#f7d6a3] rounded-full px-3 py-1 text-xs font-semibold',
  };

  return (
    <span className={`inline-block ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

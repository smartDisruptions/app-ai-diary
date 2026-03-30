'use client';

import React from 'react';

interface InputProps {
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  name?: string;
  id?: string;
  rows?: number;
  disabled?: boolean;
  type?: string;
}

export function Input({
  multiline = false,
  className = '',
  rows = 4,
  type = 'text',
  ...props
}: InputProps) {
  const baseClasses =
    'w-full min-h-[44px] bg-[rgba(255,255,255,0.04)] border border-[rgba(196,154,108,0.12)] text-text-body rounded-xl px-4 py-3 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-colors duration-200';

  if (multiline) {
    return (
      <textarea
        rows={rows}
        className={`${baseClasses} resize-y ${className}`}
        {...props}
      />
    );
  }

  return (
    <input
      type={type}
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
}

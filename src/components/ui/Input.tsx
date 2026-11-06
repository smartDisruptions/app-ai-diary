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
    'w-full min-h-[44px] bg-[rgba(244,230,204,0.04)] border border-[rgba(244,230,204,0.14)] text-cream rounded-xl px-4 py-3 placeholder:text-[rgba(244,230,204,0.35)] focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors duration-200';

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

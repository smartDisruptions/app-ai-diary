'use client';

import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  const base = 'rounded-xl font-semibold transition-opacity duration-200 cursor-pointer min-h-[44px]';

  const variants = {
    primary: `bg-gradient-to-r from-[#c49a6c] to-[#a07850] text-[#141416] px-5 py-2.5 hover:opacity-80 ${base}`,
    ghost: `bg-transparent text-[#c49a6c] px-5 py-2.5 hover:bg-[rgba(196,154,108,0.1)] ${base}`,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

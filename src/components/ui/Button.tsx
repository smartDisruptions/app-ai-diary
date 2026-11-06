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
  const base = 'rounded-xl font-semibold transition-[opacity,background-color,box-shadow] duration-200 cursor-pointer min-h-[44px]';

  const variants = {
    primary: `bg-gradient-to-b from-[#f4c578] to-[#e19a3f] text-[#2a1709] px-5 py-2.5 shadow-[0_10px_28px_-12px_rgba(242,181,94,0.6)] hover:shadow-[0_12px_32px_-10px_rgba(242,181,94,0.75)] ${base}`,
    ghost: `bg-[rgba(244,230,204,0.04)] border border-[rgba(244,230,204,0.14)] text-cream px-5 py-2.5 hover:bg-[rgba(244,230,204,0.08)] ${base}`,
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

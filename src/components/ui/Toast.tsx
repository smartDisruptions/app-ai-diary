'use client';

import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const typeStyles = {
  success: 'border-[rgba(242,181,94,0.4)] bg-[rgba(30,24,20,0.92)] text-[#f7d6a3]',
  error: 'border-[rgba(255,140,120,0.45)] bg-[rgba(40,20,20,0.92)] text-[#ffb4a6]',
  info: 'border-[rgba(244,230,204,0.25)] bg-[rgba(24,20,28,0.92)] text-cream',
};

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed z-50 left-4 right-4 md:left-auto md:right-6 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] md:bottom-6 flex justify-center md:block">
      <div
        className={`border rounded-xl px-5 py-3 shadow-lg backdrop-blur-sm ${typeStyles[type]}`}
        role="alert"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={onClose}
            className="text-current opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}

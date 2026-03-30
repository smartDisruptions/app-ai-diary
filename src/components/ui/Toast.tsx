'use client';

import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const typeStyles = {
  success: 'border-green-500/40 bg-green-500/10 text-green-300',
  error: 'border-red-500/40 bg-red-500/10 text-red-300',
  info: 'border-copper/40 bg-copper/10 text-copper',
};

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
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

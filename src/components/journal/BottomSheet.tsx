'use client';

import React, { useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: isOpen ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 md:left-60 bottom-0 z-50 transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          maxHeight: '70vh',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          background: 'linear-gradient(180deg, #1b1620, #120f14)',
          border: '1px solid var(--line)',
          borderBottom: 'none',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="rounded-full"
            style={{
              width: 36,
              height: 4,
              background: 'rgba(244,230,204,0.22)',
            }}
          />
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto px-6 pb-[calc(32px+env(safe-area-inset-bottom,0px))]"
          style={{ maxHeight: 'calc(70vh - 32px)' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

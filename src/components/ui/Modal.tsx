'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  maxWidthClass?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  className = '',
  maxWidthClass = 'max-w-2xl',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    const handleBeforePrint = () => {
      document.body.style.overflow = 'visible';
    };

    const handleAfterPrint = () => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      id="modal-portal-root"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/75 backdrop-blur-md flex justify-center items-start pt-6 sm:pt-10 md:pt-12 pb-16 px-4 animate-fade-in"
      style={{ margin: 0 }}
      role="dialog"
      aria-modal="true"
    >
      <div className={`w-full ${maxWidthClass} relative ${className}`}>
        {children}
      </div>
    </div>,
    document.body
  );
}

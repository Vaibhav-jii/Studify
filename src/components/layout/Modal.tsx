import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../form-controls/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md' 
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`
          w-full ${sizes[size]} glass-card rounded-[var(--radius-lg)] p-6 my-8
          max-h-[90vh] overflow-y-auto
          animate-in zoom-in-95 duration-200
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 id="modal-title" className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>
          <Button
            variant="icon"
            size="sm"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="mb-6">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

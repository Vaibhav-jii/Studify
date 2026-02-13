import React from 'react';
import { X } from 'lucide-react';

interface ChipProps {
  label: string;
  onRemove?: () => void;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ 
  label, 
  onRemove, 
  selected = false,
  onClick,
  className = '' 
}: ChipProps) {
  return (
    <div 
      className={`
        inline-flex items-center gap-2 px-3 py-1.5
        backdrop-blur-md border rounded-full text-sm font-medium
        transition-all duration-300
        ${selected 
          ? 'bg-[var(--color-primary-violet)]/30 border-[var(--color-primary-violet)]/50 text-[var(--color-text-primary)]' 
          : 'bg-white/20 border-white/30 text-[var(--color-text-muted)] hover:bg-white/30'
        }
        ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-[var(--color-text-primary)] transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

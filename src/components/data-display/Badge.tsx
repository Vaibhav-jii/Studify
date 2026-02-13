import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}: BadgeProps) {
  const variants = {
    default: 'bg-white/20 text-[var(--color-text-primary)] border-white/30',
    success: 'bg-[var(--color-success)]/20 text-[var(--color-success)] border-[var(--color-success)]/30',
    warning: 'bg-[var(--color-warning)]/20 text-[var(--color-warning)] border-[var(--color-warning)]/30',
    error: 'bg-[var(--color-error)]/20 text-[var(--color-error)] border-[var(--color-error)]/30',
    info: 'bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-blue)] border-[var(--color-accent-blue)]/30'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`
      inline-flex items-center justify-center
      backdrop-blur-md border rounded-full font-medium
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {children}
    </span>
  );
}

export function DifficultyBadge({ level }: { level: 'easy' | 'medium' | 'hard' }) {
  const config = {
    easy: { variant: 'success' as const, label: 'Easy' },
    medium: { variant: 'warning' as const, label: 'Medium' },
    hard: { variant: 'error' as const, label: 'Hard' }
  };

  const { variant, label } = config[level];

  return <Badge variant={variant}>{label}</Badge>;
}

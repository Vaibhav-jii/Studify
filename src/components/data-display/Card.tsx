import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'compact' | 'resource' | 'elevated';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ 
  children, 
  variant = 'default', 
  className = '',
  onClick,
  hoverable = false
}: CardProps) {
  const baseStyles = `
    glass-card rounded-[var(--radius-md)] transition-all duration-300
    ${onClick || hoverable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(88,76,120,0.18)]' : ''}
  `;

  const variants = {
    default: 'p-6',
    compact: 'p-4',
    resource: 'p-5',
    elevated: 'p-6 shadow-[0_24px_48px_rgba(88,76,120,0.16)]'
  };

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${className}`}
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
      {children}
    </div>
  );
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  trend 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
}) {
  return (
    <Card variant="default">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--color-text-muted)]">{title}</h3>
        {icon && <div className="text-[var(--color-primary-violet)]">{icon}</div>}
      </div>
      <div className="mb-2">
        <p className="text-3xl font-bold text-[var(--color-text-primary)]">{value}</p>
      </div>
      {subtitle && (
        <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
      )}
      {trend && (
        <div className={`mt-2 text-sm font-medium ${trend.value >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </Card>
  );
}

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  className = '',
  disabled,
  children,
  ...props 
}: ButtonProps) {
  const baseStyles = `
    relative inline-flex items-center justify-center
    font-medium rounded-[var(--radius-md)] transition-all duration-300
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-violet)]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      glass-card text-[var(--color-text-primary)]
      hover:shadow-[0_8px_30px_rgba(155,124,255,0.2)] hover:-translate-y-1
      active:shadow-[0_4px_15px_rgba(155,124,255,0.15)]
    `,
    secondary: `
      bg-white/20 backdrop-blur-md border border-white/30
      text-[var(--color-text-primary)] hover:bg-white/30 hover:-translate-y-1
      shadow-[0_8px_20px_rgba(88,76,120,0.08)]
    `,
    ghost: `
      bg-transparent hover:bg-white/10 text-[var(--color-text-primary)]
    `,
    icon: `
      glass-card w-10 h-10 p-0
      hover:shadow-[0_8px_20px_rgba(155,124,255,0.15)] hover:-translate-y-0.5
    `
  };

  const sizes = {
    sm: variant === 'icon' ? 'w-8 h-8' : 'px-4 py-2 text-sm',
    md: variant === 'icon' ? 'w-10 h-10' : 'px-6 py-3 text-base',
    lg: variant === 'icon' ? 'w-12 h-12' : 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : children}
    </button>
  );
}

import React from 'react';
import { Search, X } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  onClear?: () => void;
}

export function Input({ 
  label, 
  error, 
  icon,
  onClear,
  className = '',
  ...props 
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 font-medium text-[var(--color-text-primary)]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 ${icon ? 'pl-11' : ''} ${onClear ? 'pr-11' : ''}
            glass-card rounded-[var(--radius-md)]
            text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
            focus:shadow-[0_8px_30px_rgba(155,124,255,0.15)]
            transition-all duration-300
            ${error ? 'border-[var(--color-error)]' : ''}
            ${className}
          `}
          {...props}
        />
        {onClear && props.value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Clear input"
          >
            <X size={18} />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search...",
  onClear,
  className = ''
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      icon={<Search size={20} />}
      onClear={onClear}
      className={className}
    />
  );
}

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'font-mono transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-zinc-900',
    secondary: 'bg-zinc-700 hover:bg-zinc-600 text-emerald-400 border border-zinc-600',
    ghost: 'bg-transparent hover:bg-zinc-800 text-emerald-400',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
}

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
};

export function Button({
  children,
  variant = 'primary',
  loading,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}

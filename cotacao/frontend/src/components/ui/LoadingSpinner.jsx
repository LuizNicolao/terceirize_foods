import React from 'react';
import { clsx } from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    neutral: 'border-neutral-600'
  };

  const spinnerClasses = clsx(
    'animate-spin rounded-full border-2 border-transparent',
    sizeClasses[size],
    colorClasses[color],
    'border-t-current',
    className
  );

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className={spinnerClasses} />
        <p className="mt-2 text-sm text-neutral-600">{text}</p>
      </div>
    );
  }

  return <div className={spinnerClasses} />;
};

export default LoadingSpinner;

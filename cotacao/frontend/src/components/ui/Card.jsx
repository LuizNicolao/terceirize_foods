import React from 'react';
import { clsx } from 'clsx';

const Card = ({ 
  children, 
  title,
  subtitle,
  className = '',
  padding = 'p-6',
  shadow = 'shadow-sm',
  border = 'border border-neutral-200',
  hover = false,
  ...props 
}) => {
  const cardClasses = clsx(
    'bg-white rounded-lg transition-all',
    padding,
    shadow,
    border,
    {
      'hover:shadow-md': hover
    },
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-neutral-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-neutral-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;

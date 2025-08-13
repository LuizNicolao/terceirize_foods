/**
 * Componente Card reutilizável
 * Implementa diferentes variantes e layouts
 */

import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  variant = 'default', 
  padding = 'medium',
  shadow = 'medium',
  hover = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClass = 'card';
  const variantClass = `card--${variant}`;
  const paddingClass = `card--padding-${padding}`;
  const shadowClass = `card--shadow-${shadow}`;
  const hoverClass = hover ? 'card--hover' : '';
  const clickableClass = onClick ? 'card--clickable' : '';

  const cardClasses = [
    baseClass,
    variantClass,
    paddingClass,
    shadowClass,
    hoverClass,
    clickableClass,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Subcomponentes do Card
Card.Header = ({ children, className = '', ...props }) => (
  <div className={`card__header ${className}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className = '', ...props }) => (
  <div className={`card__body ${className}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`card__footer ${className}`} {...props}>
    {children}
  </div>
);

Card.Title = ({ children, className = '', ...props }) => (
  <h3 className={`card__title ${className}`} {...props}>
    {children}
  </h3>
);

Card.Subtitle = ({ children, className = '', ...props }) => (
  <p className={`card__subtitle ${className}`} {...props}>
    {children}
  </p>
);

export default Card;

import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'default',
  shadow = 'soft',
  border = true,
  ...props
}) => {
  const baseClasses = 'bg-white overflow-hidden rounded-xl';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  const shadowClasses = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    strong: 'shadow-strong',
  };
  
  const borderClasses = border ? 'border border-gray-200' : '';
  
  const classes = [
    baseClasses,
    paddingClasses[padding],
    shadowClasses[shadow],
    borderClasses,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({
  children,
  className = '',
  ...props
}) => {
  const classes = [
    'px-6 py-4 border-b border-gray-200 bg-gray-50',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardBody = ({
  children,
  className = '',
  ...props
}) => {
  const classes = [
    'px-6 py-4',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({
  children,
  className = '',
  ...props
}) => {
  const classes = [
    'px-6 py-4 border-t border-gray-200 bg-gray-50',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

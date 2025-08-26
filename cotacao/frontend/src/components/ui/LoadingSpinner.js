import React from 'react';

const LoadingSpinner = ({ inline = false, text = '' }) => {
  const containerClasses = inline 
    ? 'flex justify-center items-center p-5'
    : 'flex justify-center items-center h-screen bg-gray-50';

  const spinnerClasses = inline
    ? 'w-8 h-8 border-3 border-gray-200 border-t-gray-500 rounded-full animate-spin'
    : 'w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin';

  const textClasses = inline
    ? 'ml-3 text-gray-600 text-sm'
    : 'ml-3 text-gray-600 text-sm';

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses} />
      {text && <div className={textClasses}>{text}</div>}
    </div>
  );
};

export default LoadingSpinner;

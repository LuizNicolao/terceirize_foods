import React from 'react';

const LoadingSpinner = ({ inline = false, text = '' }) => {
  const containerClasses = inline 
    ? 'flex justify-center items-center p-5'
    : 'flex justify-center items-center h-screen bg-gradient-to-br from-green-500 to-green-700';

  const spinnerClasses = inline
    ? 'w-8 h-8 border-3 border-green-200 border-t-green-500 rounded-full animate-spin'
    : 'w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin';

  const textClasses = inline
    ? 'ml-3 text-gray-600 text-sm'
    : 'ml-3 text-white text-sm';

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses} />
      {text && <div className={textClasses}>{text}</div>}
    </div>
  );
};

export default LoadingSpinner; 
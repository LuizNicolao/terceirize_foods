import React from 'react';

const AnaliseErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
      <p className="text-red-800">{error}</p>
    </div>
  );
};

export default AnaliseErrorMessage;


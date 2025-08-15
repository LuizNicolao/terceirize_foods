import React from 'react';

const ValidationSummary = ({ errors, title = "Por favor, corrija os seguintes erros:" }) => {
  // Filtra apenas os erros que existem
  const errorList = Object.entries(errors)
    .filter(([_, error]) => error && error.trim() !== '')
    .map(([field, error]) => ({ field, error }));

  if (errorList.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="text-sm font-medium text-red-800">{title}</h3>
      </div>
      <ul className="list-disc list-inside space-y-1">
        {errorList.map(({ field, error }, index) => (
          <li key={index} className="text-sm text-red-700">
            <span className="font-medium">{field}:</span> {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ValidationSummary;

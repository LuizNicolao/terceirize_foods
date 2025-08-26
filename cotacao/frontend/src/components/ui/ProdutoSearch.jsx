import React from 'react';

const ProdutoSearch = ({ 
  value, 
  onChange, 
  placeholder = "Buscar produto...",
  disabled = false 
}) => {
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default ProdutoSearch;

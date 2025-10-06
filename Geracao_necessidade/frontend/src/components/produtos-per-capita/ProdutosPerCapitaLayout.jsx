import React from 'react';
import { FaBox } from 'react-icons/fa';

const ProdutosPerCapitaLayout = ({ children, actions }) => {
  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <FaBox className="mr-2 sm:mr-3 text-green-600" />
            Produtos Per Capita
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie os produtos e suas per capita por período
          </p>
        </div>
        {actions}
      </div>

      {/* Conteúdo Principal */}
      <div className="space-y-4 md:space-y-6">
        {children}
      </div>
    </div>
  );
};

export default ProdutosPerCapitaLayout;

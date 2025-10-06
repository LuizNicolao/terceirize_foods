import React from 'react';
import { FaTools } from 'react-icons/fa';

const SolicitacoesManutencaoLayout = ({ children, actions }) => {
  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <FaTools className="mr-2 sm:mr-3 text-green-600" />
            Solicitações de Manutenção
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie solicitações de manutenção das escolas
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

export default SolicitacoesManutencaoLayout;

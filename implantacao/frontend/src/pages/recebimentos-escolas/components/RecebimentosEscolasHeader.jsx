/**
 * Componente de Cabeçalho da página de Recebimentos Escolas
 * Exibe título, descrição e botões de ação
 */

import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { Button } from '../../../components/ui';

const RecebimentosEscolasHeader = ({ 
  canCreate, 
  canView, 
  onAddRecebimento, 
  onShowHelp, 
  loading 
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            📦 Recebimentos Escolas
            <button
              onClick={onShowHelp}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Ajuda"
            >
              <FaQuestionCircle size={16} />
            </button>
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie recebimentos de produtos nas escolas
          </p>
        </div>
        
        <div className="flex space-x-3">
          {canCreate && (
            <Button
              onClick={onAddRecebimento}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <FaPlus size={14} />
              <span>Novo Recebimento</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecebimentosEscolasHeader;

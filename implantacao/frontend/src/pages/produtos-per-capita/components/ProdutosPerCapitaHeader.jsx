import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { Button } from '../../../components/ui';

const ProdutosPerCapitaHeader = ({ 
  canCreate, 
  onAddProduto, 
  onOpenAuditModal 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
        Gerenciar Produtos Per Capita
      </h1>
      <div className="flex gap-2 sm:gap-3">
        <Button
          onClick={onOpenAuditModal}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          <FaQuestionCircle className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Auditoria</span>
        </Button>
        {canCreate && (
          <Button onClick={onAddProduto} size="sm">
            <FaPlus className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Adicionar Produto</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProdutosPerCapitaHeader;

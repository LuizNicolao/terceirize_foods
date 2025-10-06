import React from 'react';
import { FaTimes, FaEye } from 'react-icons/fa';
import { Button } from '../ui';

const ProdutoOrigemViewModal = ({
  isOpen,
  onClose,
  produtoOrigem
}) => {
  if (!isOpen || !produtoOrigem) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-full mx-2 sm:mx-4 max-h-[90vh] sm:max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FaEye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Visualizar Produto Origem
                </h2>
                <p className="text-sm text-gray-600">
                  Visualizando informações do produto origem
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <FaTimes className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {produtoOrigem.codigo}
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {produtoOrigem.nome}
                </div>
              </div>

              {/* Unidade de Medida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade de Medida
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {produtoOrigem.unidade_medida_nome || '-'}
                </div>
              </div>

              {/* Fator de Conversão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fator de Conversão
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {produtoOrigem.fator_conversao ? parseFloat(produtoOrigem.fator_conversao).toFixed(3) : '1.000'}
                </div>
              </div>

              {/* Grupo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupo
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {produtoOrigem.grupo_nome || '-'}
                </div>
              </div>

              {/* Subgrupo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subgrupo
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {produtoOrigem.subgrupo_nome || '-'}
                </div>
              </div>

              {/* Classe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classe
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {produtoOrigem.classe_nome || '-'}
                </div>
              </div>

              {/* Peso Líquido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso Líquido (kg)
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {produtoOrigem.peso_liquido ? parseFloat(produtoOrigem.peso_liquido).toFixed(3) : '-'}
                </div>
              </div>

              {/* Produto Genérico Padrão */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produto Genérico Padrão
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {produtoOrigem.produto_generico_padrao_nome ? 
                    `${produtoOrigem.produto_generico_padrao_codigo} - ${produtoOrigem.produto_generico_padrao_nome}` : 
                    'Nenhum produto genérico vinculado'
                  }
                </div>
              </div>

              {/* Referência de Mercado */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referência de Mercado
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  {produtoOrigem.referencia_mercado || '-'}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  <select 
                    value={produtoOrigem.status} 
                    disabled 
                    className="bg-transparent text-sm text-gray-900 w-full border-none outline-none"
                  >
                    <option value={1}>Ativo</option>
                    <option value={0}>Inativo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <Button type="button" variant="outline" size="lg" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutoOrigemViewModal;

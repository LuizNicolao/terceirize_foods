import React from 'react';
import { Input } from '../../ui';

/**
 * Seção de Informações Básicas da Receita
 */
const InformacoesBasicas = ({
  receita,
  formData,
  errors,
  isViewMode,
  onInputChange
}) => {

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
        Informações Básicas
      </h3>
      <div className="space-y-3">
        {/* Código (somente leitura) */}
        {receita && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código da Receita
            </label>
            <Input
              type="text"
              value={receita.codigo || ''}
              disabled
              className="bg-gray-100"
            />
          </div>
        )}

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Receita <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.nome}
            onChange={(e) => onInputChange('nome', e.target.value.toUpperCase())}
            disabled={isViewMode}
            error={errors.nome}
            placeholder="Digite o nome da receita"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição da Receita
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
            value={formData.descricao}
            onChange={(e) => onInputChange('descricao', e.target.value)}
            disabled={isViewMode}
            rows={6}
            placeholder="Digite a descrição da receita (opcional)"
          />
        </div>
      </div>
    </div>
  );
};

export default InformacoesBasicas;


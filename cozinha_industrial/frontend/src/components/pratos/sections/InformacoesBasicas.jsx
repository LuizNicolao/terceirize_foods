import React from 'react';
import { Input } from '../../ui';

/**
 * Seção de Informações Básicas do Prato
 */
const InformacoesBasicas = ({
  prato,
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
        {prato && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código
            </label>
            <Input
              type="text"
              value={prato.codigo || ''}
              disabled
              className="bg-gray-100"
            />
          </div>
        )}

        {/* Nome do Prato */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Prato <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.nome}
            onChange={(e) => onInputChange('nome', e.target.value.toUpperCase())}
            disabled={isViewMode}
            error={errors.nome}
            placeholder="Digite o nome do prato"
          />
        </div>

        {/* Descrição do Prato */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
            Descrição do Prato
          </label>
            <span className={`text-xs font-medium ${(formData.descricao || '').length > 220 ? 'text-red-500' : (formData.descricao || '').length > 200 ? 'text-amber-500' : 'text-gray-500'}`}>
              {220 - ((formData.descricao || '').length)} caracteres restantes
            </span>
          </div>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none uppercase"
            value={formData.descricao}
            onChange={(e) => {
              const valor = e.target.value.toUpperCase();
              // Limitar a 220 caracteres
              if (valor.length <= 220) {
                onInputChange('descricao', valor);
              }
            }}
            disabled={isViewMode}
            rows={5}
            maxLength={220}
            placeholder="Digite a descrição do prato (máximo 220 caracteres)"
          />
        </div>
      </div>
    </div>
  );
};

export default InformacoesBasicas;


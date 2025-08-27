import React from 'react';
import { FaUser, FaMapMarkerAlt, FaShoppingCart, FaExclamationTriangle } from 'react-icons/fa';
import { FilialSearch } from '../../../../components/ui';

const InformacoesBasicas = ({ 
  formData, 
  errors, 
  handleInputChange, 
  motivosEmergenciais 
}) => {
  const getPlaceholderText = () => {
    const motivo = formData.motivoEmergencial;
    
    switch (motivo) {
      case 'Atraso fornecedor':
        return 'Informe o fornecedor que não entregou na data';
      case 'Substituição/Reposição de produtos (ponto a ponto)':
        return 'Informe o fornecedor que gerou o problema';
      case 'Outro(s)':
        return 'Descreva detalhadamente o(s) motivo(s) da compra emergencial';
      default:
        return 'Descreva detalhadamente o motivo da compra emergencial';
    }
  };

  const getFieldLabel = () => {
    const motivo = formData.motivoEmergencial;
    
    switch (motivo) {
      case 'Atraso fornecedor':
        return 'Fornecedor com Atraso';
      case 'Substituição/Reposição de produtos (ponto a ponto)':
        return 'Fornecedor que Gerou o Problema';
      default:
        return 'Justificativa Detalhada';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-green-500 flex items-center gap-2">
        📋 Informações Básicas
      </h2>
      
      <div className="space-y-6">
        {/* Comprador e Local de Entrega */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
              <FaUser className="text-gray-400" />
              Comprador
            </label>
            <input
              type="text"
              value={formData.comprador}
              disabled
              className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-400" />
              Local de Entrega *
            </label>
            <FilialSearch
              value={formData.localEntrega}
              placeholder="Buscar filial no sistema..."
              onSelect={(filialSelecionada) => {
                if (filialSelecionada) {
                  const nomeCompleto = filialSelecionada.nome || filialSelecionada.razao_social;
                  handleInputChange('localEntrega', nomeCompleto);
                }
              }}
            />
            {errors.localEntrega && (
              <span className="text-red-500 text-sm">{errors.localEntrega}</span>
            )}
          </div>
        </div>

        {/* Tipo de Compra */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
            <FaShoppingCart className="text-gray-400" />
            Tipo de Compra *
          </label>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="tipoCompra"
                value="programada"
                checked={formData.tipoCompra === 'programada'}
                onChange={(e) => handleInputChange('tipoCompra', e.target.value)}
                className="w-3.5 h-3.5 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="text-gray-700 text-sm">Compra Programada</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="tipoCompra"
                value="emergencial"
                checked={formData.tipoCompra === 'emergencial'}
                onChange={(e) => handleInputChange('tipoCompra', e.target.value)}
                className="w-3.5 h-3.5 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="text-gray-700 text-sm">Compra Emergencial</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="tipoCompra"
                value="tag"
                checked={formData.tipoCompra === 'tag'}
                onChange={(e) => handleInputChange('tipoCompra', e.target.value)}
                className="w-3.5 h-3.5 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="text-gray-700 text-sm">TAG</span>
            </label>
          </div>
        </div>

        {/* Motivo Emergencial */}
        {formData.tipoCompra === 'emergencial' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
                <FaExclamationTriangle className="text-gray-400" />
                Motivo *
              </label>
              <select
                value={formData.motivoEmergencial}
                onChange={(e) => handleInputChange('motivoEmergencial', e.target.value)}
                className={`px-3 py-2 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm ${
                  errors.motivoEmergencial ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                }`}
              >
                <option value="">Selecione o motivo</option>
                {motivosEmergenciais.map((motivo) => (
                  <option key={motivo} value={motivo}>
                    {motivo}
                  </option>
                ))}
              </select>
              {errors.motivoEmergencial && (
                <span className="text-red-500 text-sm">{errors.motivoEmergencial}</span>
              )}
            </div>
            
            {formData.motivoEmergencial && (
              <div className="flex flex-col gap-2">
                <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                  {getFieldLabel()} *
                </label>
                <textarea
                  value={formData.justificativa}
                  onChange={(e) => handleInputChange('justificativa', e.target.value)}
                  placeholder={getPlaceholderText()}
                  rows="3"
                  className={`px-3 py-2 border-2 rounded-lg resize-vertical transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm ${
                    errors.justificativa ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                  }`}
                />
                {errors.justificativa && (
                  <span className="text-red-500 text-sm">{errors.justificativa}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InformacoesBasicas;

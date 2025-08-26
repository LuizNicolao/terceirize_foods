import React from 'react';
import { FaPaperPlane, FaSync } from 'react-icons/fa';

const BotoesAcaoSupervisor = ({ onEnviarGestor, onSolicitarRenegociacao, saving, cotacao }) => {
  // Mostrar botões apenas para cotações que o supervisor pode analisar
  // Status válidos: em_analise (aguardando análise do supervisor)
  // Não mostrar para cotações em renegociação, aprovadas, rejeitadas, etc.
  const canShowActions = cotacao?.status === 'em_analise';

  if (!canShowActions) {
    // Se a cotação estiver em renegociação, mostrar mensagem informativa
    if (cotacao?.status === 'renegociacao') {
      return (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800 font-medium mb-2">
                <i className="fas fa-info-circle mr-2"></i>
                Cotação em Renegociação
              </div>
              <div className="text-blue-600 text-sm">
                Esta cotação está em processo de renegociação. Apenas visualização é permitida.
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Se a cotação já foi enviada para gestão, mostrar mensagem informativa
    if (cotacao?.status === 'aguardando_aprovacao') {
      return (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-800 font-medium mb-2">
                <i className="fas fa-check-circle mr-2"></i>
                Cotação Enviada para Gestão
              </div>
              <div className="text-green-600 text-sm">
                Esta cotação já foi enviada para análise da gerência. Apenas visualização é permitida.
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Para outros status, mostrar mensagem genérica
    return (
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-gray-800 font-medium mb-2">
              <i className="fas fa-info-circle mr-2"></i>
              Ação Não Disponível
            </div>
            <div className="text-gray-600 text-sm">
              Esta cotação não está em um status que permita ações do supervisor.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 justify-center mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={onEnviarGestor}
        disabled={saving}
        className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-green-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaPaperPlane />
        {saving ? 'Enviando...' : 'Enviar para Gestor'}
      </button>
      <button
        onClick={onSolicitarRenegociacao}
        className="bg-orange-500 text-white px-6 py-3 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-orange-600 hover:-translate-y-0.5"
      >
        <FaSync />
        Solicitar Renegociação
      </button>
    </div>
  );
};

export default BotoesAcaoSupervisor;

import React, { useState } from 'react';
import { FaInfoCircle, FaTimes } from 'react-icons/fa';

export const SecurityNotice = ({ isVisible, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Dica de Segurança
            </h4>
            <p className="text-sm text-blue-700 mb-2">
              A opção "Mantenha-me conectado" mantém você logado por 30 dias.
            </p>
            
            {isExpanded && (
              <div className="text-xs text-blue-600 space-y-1 mt-2">
                <p>• Use apenas em dispositivos pessoais e seguros</p>
                <p>• Sempre faça logout ao usar computadores públicos</p>
                <p>• Sua sessão será encerrada automaticamente após 30 dias</p>
                <p>• Você pode fazer logout manualmente a qualquer momento</p>
              </div>
            )}
            
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {isExpanded ? 'Ver menos' : 'Ver mais'}
            </button>
          </div>
        </div>
        
        <button
          type="button"
          onClick={onClose}
          className="text-blue-400 hover:text-blue-600 ml-2"
        >
          <FaTimes size={14} />
        </button>
      </div>
    </div>
  );
};

export default SecurityNotice;

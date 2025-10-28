import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';

const ConsultaStatusHeader = ({ 
  canView, 
  onShowHelp, 
  loading 
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            📋 Consulta Status Necessidade
            <button
              onClick={onShowHelp}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Ajuda"
            >
              <FaQuestionCircle size={16} />
            </button>
          </h1>
          <p className="text-gray-600 mt-1">
            Consulte o status das necessidades geradas e suas substituições
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsultaStatusHeader;

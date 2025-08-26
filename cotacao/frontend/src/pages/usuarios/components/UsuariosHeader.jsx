import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';

const UsuariosHeader = ({ onCreate }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Usuários
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Gerencie os usuários do sistema de cotação
        </p>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => {/* TODO: Implementar auditoria */}}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <FaQuestionCircle />
          Auditoria
        </button>
        
        <button
          onClick={onCreate}
          className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium text-sm"
        >
          <FaPlus />
          Adicionar Usuário
        </button>
      </div>
    </div>
  );
};

export default UsuariosHeader;

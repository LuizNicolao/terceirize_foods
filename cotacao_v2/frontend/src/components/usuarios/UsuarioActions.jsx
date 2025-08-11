import React from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';

const UsuarioActions = ({ isSubmitting, handleSubmit, handleCancel }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Editar Usuário
      </h1>
      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FaTimes className="mr-2 h-4 w-4" />
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSave className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
};

export default UsuarioActions;

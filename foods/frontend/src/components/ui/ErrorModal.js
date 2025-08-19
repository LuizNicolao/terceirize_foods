import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ErrorModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 max-w-lg w-11/12 max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h3 className="text-red-500 text-lg font-semibold m-0 flex items-center gap-2">
            <FaExclamationTriangle />
            Erro de Exclusão
          </h3>
          <button 
            className="bg-transparent border-none cursor-pointer text-gray-500 text-lg p-1 rounded transition-all duration-300 hover:bg-gray-100 hover:text-gray-700"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
          {message}
        </div>
        
        <div className="flex justify-end mt-5 pt-4 border-t border-gray-200">
          <button 
            className="bg-blue-500 text-white px-5 py-2.5 rounded-md text-sm font-semibold border-none cursor-pointer transition-all duration-300 hover:bg-blue-600 hover:transform hover:-translate-y-0.5"
            onClick={onClose}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal; 
import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { Button } from './index';

const ValidationErrorModal = ({ isOpen, onClose, errors, errorCategories }) => {
  if (!isOpen) return null;

  const categoryNames = {
    basicInfo: 'Informações Básicas',
    classification: 'Classificação',
    dimensions: 'Dimensões e Pesos',
    taxation: 'Tributação',
    documents: 'Documentos e Registros',
    references: 'Referências'
  };

  const categoryIcons = {
    basicInfo: '📋',
    classification: '🏷️',
    dimensions: '📏',
    taxation: '💰',
    documents: '📄',
    references: '🔗'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl" />
            <h2 className="text-xl font-semibold text-gray-900">
              Erros de Validação
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="p-2"
          >
            <FaTimes className="text-gray-500" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {errorCategories ? (
            // Exibir erros organizados por categoria
            <div className="space-y-4">
              {Object.entries(errorCategories).map(([category, categoryErrors]) => {
                if (categoryErrors.length === 0) return null;
                
                return (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{categoryIcons[category]}</span>
                      <h3 className="font-semibold text-gray-900">
                        {categoryNames[category]}
                      </h3>
                    </div>
                    <ul className="space-y-1">
                      {categoryErrors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-red-600">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{error.msg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : (
            // Exibir erros simples
            <div className="space-y-2">
              {errors && errors.map((error, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-red-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{error.msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
          >
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ValidationErrorModal;

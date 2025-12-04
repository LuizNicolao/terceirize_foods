import React from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { Modal, Button } from '../ui';

const TemplateSelectModal = ({
  isOpen,
  onClose,
  templates = [],
  onSelect,
  title = 'Selecione o Template para Impressão'
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhum template disponível para esta tela.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer"
                  onClick={() => onSelect(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{template.nome}</h3>
                        {template.padrao && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Padrão
                          </span>
                        )}
                      </div>
                      {template.descricao && (
                        <p className="text-sm text-gray-600">{template.descricao}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(template.id);
                      }}
                      className="ml-4"
                    >
                      <FaCheck className="w-4 h-4 text-green-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TemplateSelectModal;


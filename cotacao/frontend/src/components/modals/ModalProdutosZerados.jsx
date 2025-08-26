import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ModalProdutosZerados = ({ isOpen, onClose, produtosZerados }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Produtos com Valor Zerado
              </h3>
              <p className="text-sm text-gray-600">
                Não é possível enviar a cotação para o supervisor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-4">
              A cotação possui os seguintes produtos com valor unitário zerado ou não preenchido:
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="space-y-3">
              {produtosZerados.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border border-red-100">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {item.produto}
                    </div>
                    <div className="text-sm text-gray-600">
                      Fornecedor: {item.fornecedor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Como resolver:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Edite a cotação e preencha todos os valores unitários</li>
                  <li>• Verifique se todos os fornecedores informaram seus preços</li>
                  <li>• Certifique-se de que não há campos vazios ou zerados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProdutosZerados;

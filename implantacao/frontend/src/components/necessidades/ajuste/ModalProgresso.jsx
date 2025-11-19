import React from 'react';
import { Modal } from '../../ui';
import { FaSpinner } from 'react-icons/fa';

const ModalProgresso = ({
  isOpen,
  title = 'Processando...',
  progresso = 0,
  total = 0,
  mensagem = 'Aguarde, processando registros...'
}) => {
  const percentual = total > 0 ? Math.round((progresso / total) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Não permite fechar durante o processamento
      title={title}
      size="sm"
    >
      <div className="py-6 px-4">
        <div className="text-center mb-6">
          <FaSpinner className="animate-spin text-green-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-700 mb-2">{mensagem}</p>
          <p className="text-sm text-gray-500">
            {progresso} de {total} registros processados
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-green-600 h-4 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentual}%` }}
          />
        </div>

        {/* Porcentagem */}
        <div className="text-center">
          <span className="text-2xl font-bold text-green-600">{percentual}%</span>
        </div>
      </div>
    </Modal>
  );
};

export default ModalProgresso;
